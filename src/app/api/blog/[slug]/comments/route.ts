import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });

    if (!post) {
      return NextResponse.json(
        errorResponse("not_found", "Post not found"),
        { status: 404 }
      );
    }

    const where: any = {
      sourceType: "blog_post",
      sourceId: post.id,
      parentId: null,
      status: "published",
    };

    const [list, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          other_discussion: {
            where: {
              status: "published",
            },
            orderBy: {
              createdAt: "asc",
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              other_discussion: true,
            },
          },
        },
      }),
      prisma.discussion.count({ where }),
    ]);

    const discussions = list.map((discussion) => ({
      id: discussion.id,
      content: discussion.content,
      status: discussion.status,
      sourceType: discussion.sourceType,
      sourceId: discussion.sourceId,
      userId: discussion.userId,
      parentId: discussion.parentId,
      editedAt: discussion.editedAt,
      editCount: discussion.editCount,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      user: discussion.user,
      replies: discussion.other_discussion,
      replyCount: discussion._count.other_discussion,
    }));

    return NextResponse.json(
      successResponse(
        list.length === 0
          ? "No comments found"
          : `Found ${list.length} comment(s)`,
        discussions,
        {
          pagination: {
            total,
            skip,
            limit,
            hasMore: skip + limit < total,
          },
        }
      )
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch comments"),
      { status: 500 }
    );
  }
}
