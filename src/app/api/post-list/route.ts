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
  const status = searchParams.get("status") || "";
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

  const sortFilter = ["title", "slug", "uploadTime", "updatedAt"];
  const orderFilter = ["asc", "desc"];
  const maxContentFilter = ["10", "20", "50"];
  const statusFilter = ["", "published", "submitted", "drafted", "deleted"];

  if (
    !sortFilter.includes(sort) ||
    !orderFilter.includes(order) ||
    !maxContentFilter.includes(maxContent) ||
    !statusFilter.includes(status)
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
      userId: currentUser.userId,
    };

    if (search) {
      where.OR = [
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
    }

    if (status) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      prisma.post.findMany({
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
      }),
      prisma.post.count({ where }),
    ]);

    const listWithTagNames = list.map((post) => ({
      ...post,
      tags: post.tags.map((pt) => pt.tag.name),
    }));

    return NextResponse.json(
      successResponse(
        list.length === 0
          ? "No posts found"
          : `Found ${list.length} post(s)`,
        listWithTagNames,
        {
          pagination: {
            total,
            skip: skipAsNum,
            limit: maxContentAsNum,
            hasMore: skipAsNum + maxContentAsNum < total,
          },
        }
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
