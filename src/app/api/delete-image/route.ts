import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

export async function DELETE(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const body = await req.json();
    const { id, slug, isPrivate } = body;

    if (!id || !slug) {
      return NextResponse.json(
        errorResponse("validation_error", "Image ID and slug are required"),
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

    // Check if user owns the image or has permission to delete
    if (image.userId !== currentUser.userId) {
      // Only Super Admin and Content Admin can delete other users' images
      if (currentUser.role !== "super_admin" && currentUser.role !== "content_admin") {
        return NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            "You can only delete your own images"
          ),
          { status: 403 }
        );
      }
    }

    const bucket = isPrivate ? "apus-user-private" : "apus-user-public";

    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: slug,
    });

    await s3Client.send(deleteCommand);

    await prisma.gallery.delete({
      where: { id },
    });

    // Create audit log
    createAuditLogAsync({
      action: "gallery_deleted",
      entityType: "gallery",
      entityId: id,
      performedBy: currentUser.userId,
      performedByRole: currentUser.role,
      oldValue: {
        title: image.title,
        slug: image.slug,
        isPrivate: image.isPrivate,
      },
      metadata: {
        ownerId: image.userId,
      },
      req,
    });

    return NextResponse.json(
      successResponse("Image deleted successfully", null)
    );
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to delete image"),
      { status: 500 }
    );
  }
}
