import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import * as permissions from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
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
  const statusFilter = ["", "published", "submitted", "drafted", "deleted"];

  if (
    !sortFilter.includes(sort) ||
    !orderFilter.includes(order) ||
    !limitFilter.includes(limit) ||
    !statusFilter.includes(status)
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

  if (!permissions.hasPermission(currentUser.role, "review_posts")) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        "You do not have permission to review posts"
      ),
      { status: 403 }
    );
  }

  try {
    const where: any = {
      OR: [
        {
          status: {
            in: ["submitted", "published"],
          },
        },
        {
          AND: [
            {
              status: {
                in: ["drafted", "deleted"],
              },
            },
            {
              userId: currentUser.userId,
            },
          ],
        },
      ],
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

    if (status) {
      where.AND = where.AND || [];
      where.AND.push({
        status: status,
      });
    }

    const [list, total] = await Promise.all([
      prisma.post.findMany({
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
          post_tag: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const listWithFormattedData = list.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      desc: post.desc,
      image: post.image,
      status: post.status,
      tags: post.post_tag.map((pt) => pt.tag.name),
      uploadTime: post.uploadTime,
      updatedAt: post.updatedAt,
      author: {
        id: post.user.id,
        name: post.user.name,
        username: post.user.username,
        image: post.user.image,
        role: post.user.role,
      },
    }));

    return NextResponse.json(
      successResponse(
        list.length === 0
          ? "No posts found"
          : `Found ${list.length} post(s)`,
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
    console.error("Error fetching posts for review:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch posts"),
      { status: 500 }
    );
  }
}
