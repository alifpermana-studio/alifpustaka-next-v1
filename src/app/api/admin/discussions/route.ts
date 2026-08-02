import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";
import { notifyCommentStatusChanged } from "@/lib/notifications";
import * as permissions from "@/lib/permissions";
import { DiscussionStatus } from "@/types/discussion";

export async function GET(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  if (!permissions.hasPermission(currentUser.role, "moderate_discussions")) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        "You do not have permission to moderate discussions"
      ),
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sourceType = searchParams.get("sourceType") || "";
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const where: any = {
      parentId: null,
    };

    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status) {
      where.status = status;
    }

    if (sourceType) {
      where.sourceType = sourceType;
    }

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
              role: true,
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

    const discussionsWithSource = await Promise.all(
      list.map(async (discussion) => {
        let sourceTitle = "";

        if (discussion.sourceType === "blog_post") {
          const post = await prisma.post.findUnique({
            where: { id: discussion.sourceId },
            select: { title: true },
          });
          sourceTitle = post?.title || "Unknown Post";
        }

        return {
          id: discussion.id,
          content: discussion.content,
          status: discussion.status,
          sourceType: discussion.sourceType,
          sourceId: discussion.sourceId,
          sourceTitle,
          userId: discussion.userId,
          parentId: discussion.parentId,
          editedAt: discussion.editedAt,
          editCount: discussion.editCount,
          deletedAt: discussion.deletedAt,
          permanentDeleteAt: discussion.permanentDeleteAt,
          createdAt: discussion.createdAt,
          updatedAt: discussion.updatedAt,
          user: discussion.user,
          replyCount: discussion._count.other_discussion,
        };
      })
    );

    return NextResponse.json(
      successResponse(
        list.length === 0
          ? "No discussions found"
          : `Found ${list.length} discussion(s)`,
        discussionsWithSource,
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
    console.error("Error fetching discussions:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch discussions"),
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  if (!permissions.hasPermission(currentUser.role, "moderate_discussions")) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        "You do not have permission to moderate discussions"
      ),
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action, discussionIds, status } = body;

    if (!action || !discussionIds || !Array.isArray(discussionIds)) {
      return NextResponse.json(
        errorResponse("validation_error", "Action and discussionIds array are required"),
        { status: 400 }
      );
    }

    if (discussionIds.length === 0) {
      return NextResponse.json(
        errorResponse("validation_error", "No discussions selected"),
        { status: 400 }
      );
    }

    if (action === "change_status") {
      const validStatuses: DiscussionStatus[] = ["pending", "published", "banned", "deleted"];
      if (!status || !validStatuses.includes(status)) {
        return NextResponse.json(
          errorResponse("validation_error", "Invalid status"),
          { status: 400 }
        );
      }

      const discussions = await prisma.discussion.findMany({
        where: {
          id: { in: discussionIds },
        },
        select: {
          id: true,
          status: true,
          userId: true,
          content: true,
        },
      });

      const toUpdate = discussions.filter(d =>
        status === "deleted" ? d.status !== "deleted" : true
      );

      if (toUpdate.length === 0) {
        return NextResponse.json(
          errorResponse("invalid_request", "No comments can be updated"),
          { status: 400 }
        );
      }

      const updatePromises = toUpdate.map(discussion => {
        const updateData: any = { status };

        if (status === "deleted") {
          const deletedAt = new Date();
          const permanentDeleteAt = new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
          updateData.deletedAt = deletedAt;
          updateData.permanentDeleteAt = permanentDeleteAt;
        }

        return prisma.discussion.update({
          where: { id: discussion.id },
          data: updateData,
        });
      });

      const results = await Promise.allSettled(updatePromises);

      const succeeded = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      toUpdate.forEach(discussion => {
        createAuditLogAsync({
          action: "discussion_status_changed",
          entityType: "discussion",
          entityId: discussion.id,
          performedBy: currentUser.userId,
          performedByRole: currentUser.role,
          oldValue: { status: discussion.status },
          newValue: { status },
          metadata: {
            bulkAction: true,
            contentPreview: discussion.content.substring(0, 100),
          },
          req,
        });

        notifyCommentStatusChanged(
          discussion.userId,
          discussion.content,
          discussion.status,
          status,
          discussion.id
        );
      });

      return NextResponse.json(
        successResponse(
          `${succeeded} discussion(s) updated${failed > 0 ? `, ${failed} failed` : ""}`,
          { succeeded, failed }
        )
      );
    }

    return NextResponse.json(
      errorResponse("validation_error", "Invalid action"),
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing bulk action:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to process bulk action"),
      { status: 500 }
    );
  }
}
