import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import * as permissions from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const skip = searchParams.get("skip");
  const limit = searchParams.get("limit");

  if (!sort || !order || !limit || !skip) {
    return NextResponse.json(
      errorResponse("missing_parameter", "Missing required parameter"),
      { status: 400 }
    );
  }

  const sortFilter = ["title", "slug", "uploadTime", "updatedAt"];
  const orderFilter = ["asc", "desc"];
  const limitFilter = ["10", "20", "50"];

  if (
    !sortFilter.includes(sort) ||
    !orderFilter.includes(order) ||
    !limitFilter.includes(limit)
  ) {
    return NextResponse.json(
      errorResponse("invalid_parameter", "Invalid parameter value"),
      { status: 400 }
    );
  }

  const skipAsNum = parseInt(skip, 10) || 0;
  const limitAsNum = parseInt(limit, 10) || 10;

  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  if (!permissions.hasPermission(currentUser.role, "manage_public_gallery")) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        "You do not have permission to manage gallery"
      ),
      { status: 403 }
    );
  }

  try {
    const where: any = {
      isPrivate: false,
    };

    if (search) {
      const searchConditions = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];

      where.AND = where.AND || [];
      where.AND.push({
        OR: searchConditions,
      });
    }

    const [list, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        orderBy: {
          [sort]: order,
        },
        skip: skipAsNum,
        take: limitAsNum,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              role: true,
            },
          },
        },
      }),
      prisma.gallery.count({ where }),
    ]);

    const listWithFormattedData = list.map((gallery) => ({
      id: gallery.id,
      title: gallery.title,
      slug: gallery.slug,
      format: gallery.format,
      isPrivate: gallery.isPrivate,
      footnote: gallery.footnote,
      tags: gallery.tags,
      uploadTime: gallery.uploadTime,
      updatedAt: gallery.updatedAt,
      author: {
        id: gallery.user.id,
        name: gallery.user.name,
        username: gallery.user.username,
        image: gallery.user.image,
        role: gallery.user.role,
      },
    }));

    return NextResponse.json(
      successResponse(
        list.length === 0
          ? "No galleries found"
          : `Found ${list.length} gallery item(s)`,
        listWithFormattedData,
        {
          pagination: {
            total,
            skip: skipAsNum,
            limit: limitAsNum,
            hasMore: skipAsNum + limitAsNum < total,
          },
        }
      )
    );
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch galleries"),
      { status: 500 }
    );
  }
}
