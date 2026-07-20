import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";
import * as permissions from "@/lib/permissions";
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

export async function PUT(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const body = await req.json();
    const { id, title, slug, oldSlug, tags, isPrivate, oldIsPrivate, isFeatured } = body;

    if (!id) {
      return NextResponse.json(
        errorResponse("validation_error", "Image ID is required"),
        { status: 400 }
      );
    }

    const image = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json(
        errorResponse("not_found", "Image not found"),
        { status: 404 }
      );
    }

    // Check permissions for visibility toggle
    const canToggle = permissions.canToggleGalleryVisibility(
      currentUser.userId,
      image.userId,
      currentUser.role,
      image.isPrivate,
      isPrivate
    );

    if (!canToggle) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You do not have permission to change this image's visibility"
        ),
        { status: 403 }
      );
    }

    // Check if user owns the image (for non-visibility changes)
    if (image.userId !== currentUser.userId) {
      // Only Content Admin and Super Admin can edit other users' images
      if (!permissions.canManagePublicGallery(currentUser.role) && currentUser.role !== "super_admin") {
        return NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            "You can only edit your own images"
          ),
          { status: 403 }
        );
      }
    }

    // Handle S3/R2 file operations if visibility or slug changed
    if (oldIsPrivate !== isPrivate) {
      const sourceBucket = oldIsPrivate ? "apus-user-private" : "apus-user-public";
      const destBucket = isPrivate ? "apus-user-private" : "apus-user-public";

      const copyCommand = new CopyObjectCommand({
        Bucket: destBucket,
        CopySource: `${sourceBucket}/${oldSlug}`,
        Key: slug,
      });

      await s3Client.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: sourceBucket,
        Key: oldSlug,
      });

      await s3Client.send(deleteCommand);
    } else if (oldSlug !== slug) {
      const bucket = isPrivate ? "apus-user-private" : "apus-user-public";

      const copyCommand = new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${oldSlug}`,
        Key: slug,
      });

      await s3Client.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: oldSlug,
      });

      await s3Client.send(deleteCommand);
    }

    const updatedImage = await prisma.gallery.update({
      where: { id },
      data: {
        title,
        slug,
        tags: tags || [],
        isPrivate,
        isFeatured,
        path: isPrivate ? `apus-user-private/${slug}` : `apus-user-public/${slug}`,
      },
    });

    // Create audit log for visibility changes
    if (oldIsPrivate !== isPrivate) {
      createAuditLogAsync({
        action: "gallery_visibility_changed",
        entityType: "gallery",
        entityId: image.id,
        performedBy: currentUser.userId,
        performedByRole: currentUser.role,
        oldValue: { isPrivate: oldIsPrivate },
        newValue: { isPrivate },
        metadata: {
          title: updatedImage.title,
          slug: updatedImage.slug,
          ownerId: image.userId,
        },
        req,
      });
    }

    return NextResponse.json(
      successResponse("Image updated successfully", updatedImage)
    );
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to update image"),
      { status: 500 }
    );
  }
}
