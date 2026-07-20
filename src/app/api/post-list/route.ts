// app/api/post-list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import * as permissions from "@/lib/permissions";

interface PostPSQLType {
  title: string;
  id: string;
  slug: string;
  uploadTime: Date;
  tags: TagType[];
  content: string;
  image: string;
  status: string;
  desc: string;
  footnote: string;
  userId: string;
}

interface TagType {
  tag: {
    name: string;
    id: string;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const skip = searchParams.get("skip");
  const maxContent = searchParams.get("max");

  if (!sort || !order || !maxContent || !skip) {
    return NextResponse.json(
      errorResponse("missing_parameter", "Missing required parameter"),
      { status: 400 }
    );
  }

  const sortFilter = ["title", "slug", "uploadTime"];
  const orderFilter = ["asc", "desc"];
  const maxContentFilter = ["10", "20", "50"];

  if (
    !sortFilter.includes(sort) ||
    !orderFilter.includes(order) ||
    !maxContentFilter.includes(maxContent)
  ) {
    return NextResponse.json(
      errorResponse("invalid_parameter", "Invalid parameter value"),
      { status: 400 }
    );
  }

  const skipAsNum = parseInt(skip, 10) || 0;
  const maxContentAsNum = parseInt(maxContent, 10) || 10;

  // Check authentication and active status
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const where: any = {
      OR: [
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
      ],
    };

    // Role-based filtering
    const canViewAll = permissions.hasPermission(
      currentUser.role,
      "manage_all_posts"
    );
    const canReview = permissions.hasPermission(
      currentUser.role,
      "review_posts"
    );

    if (canViewAll) {
      // Super Admin and Content Admin see all posts
      // No additional filtering
    } else if (canReview) {
      // Editors see their own posts + submitted posts for review
      where.OR = [
        { userId: currentUser.userId }, // Own posts
        { status: "submitted" }, // Submitted posts for review
      ];
    } else {
      // Authors and Users see only their own posts
      where.userId = currentUser.userId;
    }

    const list = await prisma.post.findMany({
      where,
      orderBy: {
        [sort]: order,
      },
      skip: skipAsNum,
      take: maxContentAsNum,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const listWithTagNames = list.map((post) => ({
      ...post,
      tags: post.tags.map((pt) => pt.tag.name),
    }));

    return NextResponse.json(
      successResponse(
        list.length === 0
          ? "No posts found"
          : `Found ${list.length} post(s)`,
        listWithTagNames
      )
    );
  } catch (error) {
    console.error("Error fetching post list:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch posts"),
      { status: 500 }
    );
  }
}
