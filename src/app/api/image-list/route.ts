import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import * as permissions from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "uploadTime";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const max = parseInt(searchParams.get("max") || "20", 10);

    const where: any = {};

    // Role-based filtering
    const canViewAll = currentUser.role === "super_admin";
    const canManagePublic = permissions.canManagePublicGallery(currentUser.role);

    if (canViewAll) {
      // Super Admin sees everything
    } else if (canManagePublic) {
      // Content Admin sees all public + own private
      where.OR = [
        { isPrivate: false },
        { userId: currentUser.userId },
      ];
    } else {
      // Regular users see only their own
      where.userId = currentUser.userId;
    }

    // Search filter
    if (search) {
      const searchConditions = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];

      if (where.OR) {
        // Combine with existing OR conditions
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions },
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const [images, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: max,
      }),
      prisma.gallery.count({ where }),
    ]);

    return NextResponse.json(
      successResponse(
        `Found ${images.length} image(s)`,
        { images, total },
        {
          pagination: {
            total,
            skip,
            limit: max,
            hasMore: skip + max < total,
          },
        }
      )
    );
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch images"),
      { status: 500 }
    );
  }
}
