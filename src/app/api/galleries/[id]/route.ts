import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import * as permissions from "@/lib/permissions";
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  throw new Error("R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be defined.");
}

const s3Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT_S3_CLIENT,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: "auto",
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  if (!permissions.hasPermission(currentUser.role, "manage_public_gallery")) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        "You do not have permission to manage images"
      ),
      { status: 403 }
    );
  }
  try {
    const body = await req.json();
    const { action, footnote } = body;

    if (action !== "block") {
      return NextResponse.json(
        errorResponse("invalid_parameter", "Invalid action. Must be 'block'"),
        { status: 400 }
      );
    }

    if (!footnote || typeof footnote !== "string" || !footnote.trim()) {
      return NextResponse.json(
        errorResponse("missing_parameter", "Footnote is required"),
        { status: 400 }
      );
    }

    if (footnote.length > 200) {
      return NextResponse.json(
        errorResponse(
          "invalid_parameter",
          "Footnote must not exceed 200 characters"
        ),
        { status: 400 }
      );
    }

    const gallery = await prisma.gallery.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json(
        errorResponse("not_found", "Image not found"),
        { status: 404 }
      );
    }

    if (gallery.isPrivate) {
      return NextResponse.json(
        errorResponse("invalid_parameter", "Image is already private"),
        { status: 400 }
      );
    }

    // Copy file from public to private bucket
    const sourceBucket = "apus-user-public";
    const destBucket = "apus-user-private";

    try {
      const copyCommand = new CopyObjectCommand({
        Bucket: destBucket,
        CopySource: `/${sourceBucket}/${gallery.slug}${gallery.format}`,
        Key: `${gallery.slug}${gallery.format}`,
      });

      await s3Client.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: sourceBucket,
        Key: `${gallery.slug}${gallery.format}`,
      });

      await s3Client.send(deleteCommand);
    } catch (s3Error) {
      console.error("Error moving image between buckets:", s3Error);
      return NextResponse.json(
        errorResponse("internal_error", "Failed to move image to private storage"),
        { status: 500 }
      );
    }

    const updatedGallery = await prisma.gallery.update({
      where: { id },
      data: {
        isPrivate: true,
        footnote: footnote.trim(),
        path: `apus-user-private/${gallery.slug}`,
      },
    });

    await prisma.audit_log.create({
      data: {
        id: require('uuid').v4(),
        action: "image_blocked",
        entityType: "gallery",
        entityId: gallery.id,
        performedBy: currentUser.userId,
        performedByRole: currentUser.role,
        oldValue: JSON.stringify({
          isPrivate: false,
          footnote: gallery.footnote || null,
        }),
        newValue: JSON.stringify({
          isPrivate: true,
          footnote: footnote.trim(),
        }),
        metadata: {
          galleryTitle: gallery.title,
          gallerySlug: gallery.slug,
          ownerId: gallery.userId,
          ownerName: gallery.user.name,
        },
        ipAddress: req.headers.get("x-forwarded-for") || null,
        userAgent: req.headers.get("user-agent") || null,
      },
    });

    if (gallery.userId !== currentUser.userId) {
      await prisma.notification.create({
        data: {
          id: require('uuid').v4(),
          userId: gallery.userId,
          type: "image_blocked",
          title: "Your image has been blocked",
          message: `Your image "${gallery.title}" has been blocked. Reason: ${footnote.trim()}`,
          linkTo: `/gallery`,
          relatedEntityType: "gallery",
          relatedEntityId: gallery.id,
        },
      });
    }

    return NextResponse.json(
      successResponse("Image blocked successfully", {
        id: updatedGallery.id,
        isPrivate: updatedGallery.isPrivate,
        footnote: updatedGallery.footnote,
        updatedAt: updatedGallery.updatedAt,
      })
    );
  } catch (error) {
    console.error("Error blocking image:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to block image"),
      { status: 500 }
    );
  }
}
