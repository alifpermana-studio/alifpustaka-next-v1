import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";

export async function PUT(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const body = await req.json();
    const { title, slug, format, size, path, type, tags } = body;

    if (!title || !slug || !format || !size || !path || !type) {
      return NextResponse.json(
        errorResponse("validation_error", "Missing required fields"),
        { status: 400 }
      );
    }

    const gallery = await prisma.gallery.create({
      data: {
        title,
        slug: `${slug}${format}`,
        format,
        size,
        path,
        type,
        tags: tags || [],
        userId: currentUser.userId,
        isPrivate: path.includes("private"),
        isFeatured: false,
      },
    });

    // Create audit log
    createAuditLogAsync({
      action: "gallery_uploaded",
      entityType: "gallery",
      entityId: gallery.id,
      performedBy: currentUser.userId,
      performedByRole: currentUser.role,
      newValue: {
        title: gallery.title,
        slug: gallery.slug,
        isPrivate: gallery.isPrivate,
      },
      metadata: {
        format,
        size,
        type,
      },
      req,
    });

    return NextResponse.json(
      successResponse("Image uploaded successfully", gallery)
    );
  } catch (error) {
    console.error("Error uploading image to database:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to upload image"),
      { status: 500 }
    );
  }
}
