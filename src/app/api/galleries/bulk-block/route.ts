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

export async function POST(req: NextRequest) {
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
    const { galleryIds, footnote } = body;

    if (!galleryIds || !Array.isArray(galleryIds) || galleryIds.length === 0) {
      return NextResponse.json(
        errorResponse("missing_parameter", "Gallery IDs are required"),
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

    const galleries = await prisma.gallery.findMany({
      where: {
        id: { in: galleryIds },
      },
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

    if (galleries.length === 0) {
      return NextResponse.json(
        errorResponse("not_found", "No galleries found"),
        { status: 404 }
      );
    }

    const results = await Promise.allSettled(
      galleries.map(async (gallery, index) => {
        if (gallery.isPrivate) {
          throw new Error(`Image "${gallery.title}" is already private`);
        }

        const sourceBucket = "apus-user-public";
        const destBucket = "apus-user-private";

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

        await prisma.gallery.update({
          where: { id: gallery.id },
          data: {
            isPrivate: true,
            footnote: footnote.trim(),
            path: `apus-user-private/${gallery.slug}`,
          },
        });

        await prisma.audit_log.create({
          data: {
            id: require('uuid').v4(),
            action: "image_blocked_bulk",
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
              bulkOperation: true,
              totalInBatch: galleries.length,
              batchIndex: index + 1,
            },
            ipAddress: req.headers.get("x-forwarded-for") || null,
            userAgent: req.headers.get("user-agent") || null,
          },
        });

        return {
          id: gallery.id,
          title: gallery.title,
          userId: gallery.userId,
          userName: gallery.user.name,
        };
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    const successfulGalleries = results
      .filter((r) => r.status === "fulfilled")
      .map((r: any) => r.value);

    const ownerNotifications = new Map<string, { name: string; count: number; titles: string[] }>();

    successfulGalleries.forEach((gallery: any) => {
      if (gallery.userId !== currentUser.userId) {
        if (!ownerNotifications.has(gallery.userId)) {
          ownerNotifications.set(gallery.userId, {
            name: gallery.userName,
            count: 0,
            titles: [],
          });
        }
        const ownerData = ownerNotifications.get(gallery.userId)!;
        ownerData.count++;
        ownerData.titles.push(gallery.title);
      }
    });

    for (const [userId, data] of ownerNotifications.entries()) {
      const message =
        data.count === 1
          ? `Your image "${data.titles[0]}" has been blocked. Reason: ${footnote.trim()}`
          : `${data.count} of your images have been blocked. Reason: ${footnote.trim()}`;

      await prisma.notification.create({
        data: {
          id: require('uuid').v4(),
          userId,
          type: "image_blocked",
          title: data.count === 1 ? "Your image has been blocked" : "Your images have been blocked",
          message,
          linkTo: `/gallery`,
          relatedEntityType: "gallery",
          relatedEntityId: null,
        },
      });
    }

    const resultDetails = results.map((r, index) => ({
      id: galleryIds[index],
      success: r.status === "fulfilled",
      error: r.status === "rejected" ? (r.reason as Error).message : undefined,
    }));

    return NextResponse.json(
      successResponse(
        `${succeeded} image(s) blocked successfully${failed > 0 ? `, ${failed} failed` : ""}`,
        {
          succeeded,
          failed,
          results: resultDetails,
        }
      )
    );
  } catch (error) {
    console.error("Error blocking images:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to block images"),
      { status: 500 }
    );
  }
}
