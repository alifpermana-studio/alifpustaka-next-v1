import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { DiscussionStatus } from "@/types/discussion";
import { createAuditLogAsync } from "@/lib/audit-log";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sourceType = searchParams.get("sourceType") || "";
  const skip = searchParams.get("skip");
  const limit = searchParams.get("limit");

  if (!limit || !skip) {
    return NextResponse.json(
      errorResponse("missing_parameter", "Missing required parameter"),
      { status: 400 },
    );
  }

  const limitFilter = ["10", "20", "50"];
  const statusFilter = ["", "pending", "published", "banned", "deleted"];
  const sourceTypeFilter = ["", "blog_post", "product_review", "product_qa"];

  if (
    !limitFilter.includes(limit) ||
    !statusFilter.includes(status) ||
    !sourceTypeFilter.includes(sourceType)
  ) {
    return NextResponse.json(
      errorResponse("invalid_parameter", "Invalid parameter value"),
      { status: 400 },
    );
  }

  const skipAsNum = parseInt(skip, 10) || 0;
  const limitAsNum = parseInt(limit, 10) || 10;

  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const where: any = {
      userId: currentUser.userId,
      parentId: null, // Only get top-level comments
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
          _count: {
            select: {
              other_discussion: true,
            },
          },
        },
      }),
      prisma.discussion.count({ where }),
    ]);

    // Get source titles (for blog posts)
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

        // Check if user can edit (within 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const canEdit =
          discussion.createdAt > thirtyMinutesAgo &&
          discussion.status !== "deleted" &&
          discussion.status !== "banned";

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
          canEdit,
          canDelete: discussion.status !== "deleted",
        };
      }),
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
            skip: skipAsNum,
            limit: limitAsNum,
            hasMore: skipAsNum + limitAsNum < total,
          },
        },
      ),
    );
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch discussions"),
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const body = await req.json();
    const { content, sourceType, sourceId, parentId } = body;

    if (!content || !sourceType || !sourceId) {
      return NextResponse.json(
        errorResponse(
          "validation_error",
          "Content, sourceType, and sourceId are required",
        ),
        { status: 400 },
      );
    }

    // Validate content length
    if (content.trim().length < 1 || content.length > 5000) {
      return NextResponse.json(
        errorResponse(
          "validation_error",
          "Content must be between 1 and 5000 characters",
        ),
        { status: 400 },
      );
    }

    // Validate sourceType
    const validSourceTypes = ["blog_post", "product_review", "product_qa"];
    if (!validSourceTypes.includes(sourceType)) {
      return NextResponse.json(
        errorResponse("validation_error", "Invalid sourceType"),
        { status: 400 },
      );
    }

    // Verify source exists (for blog_post)
    if (sourceType === "blog_post") {
      const post = await prisma.post.findUnique({
        where: { id: sourceId },
        select: { id: true, status: true },
      });

      if (!post) {
        return NextResponse.json(errorResponse("not_found", "Post not found"), {
          status: 404,
        });
      }

      if (post.status !== "published") {
        return NextResponse.json(
          errorResponse(
            "invalid_request",
            "Cannot comment on unpublished posts",
          ),
          { status: 400 },
        );
      }
    }

    // If this is a reply, verify parent exists
    if (parentId) {
      const parent = await prisma.discussion.findUnique({
        where: { id: parentId },
        select: { id: true, userId: true, status: true },
      });

      if (!parent) {
        return NextResponse.json(
          errorResponse("not_found", "Parent comment not found"),
          { status: 404 },
        );
      }

      if (parent.status === "deleted" || parent.status === "banned") {
        return NextResponse.json(
          errorResponse(
            "invalid_request",
            "Cannot reply to deleted or banned comments",
          ),
          { status: 400 },
        );
      }
    }

    const discussion = await prisma.discussion.create({
      data: {
        id: require('uuid').v4(),
        content: content.trim(),
        sourceType,
        sourceId,
        userId: currentUser.userId,
        parentId: parentId || null,
        status: "pending",
        updatedAt: new Date(),
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
    });

    return NextResponse.json(
      successResponse("Comment created successfully", {
        id: discussion.id,
        content: discussion.content,
        status: discussion.status,
        sourceType: discussion.sourceType,
        sourceId: discussion.sourceId,
        userId: discussion.userId,
        parentId: discussion.parentId,
        createdAt: discussion.createdAt,
        user: discussion.user,
      }),
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating discussion:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to create comment"),
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;

  try {
    const body = await req.json();
    const { action, discussionIds, data } = body;

    if (!action || !discussionIds || !Array.isArray(discussionIds) || discussionIds.length === 0) {
      return NextResponse.json(
        errorResponse("validation_error", "Action and discussionIds array are required"),
        { status: 400 }
      );
    }

    const discussions = await prisma.discussion.findMany({
      where: {
        id: { in: discussionIds },
      },
      select: {
        id: true,
        userId: true,
        content: true,
        status: true,
      },
    });

    const unauthorizedDiscussions = discussions.filter((d) => d.userId !== currentUser.userId);
    
    if (unauthorizedDiscussions.length > 0) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You can only modify your own comments"
        ),
        { status: 403 }
      );
    }

    const validDiscussionIds = discussions.map((d) => d.id);

    if (action === "change_status") {
      if (!data || !data.status) {
        return NextResponse.json(
          errorResponse("validation_error", "Status is required"),
          { status: 400 }
        );
      }

      const validStatuses: DiscussionStatus[] = ["pending", "published", "deleted"];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          errorResponse("validation_error", "Invalid status. Users can only set: pending, published, deleted"),
          { status: 400 }
        );
      }

      const results = await Promise.allSettled(
        validDiscussionIds.map(async (discussionId) => {
          const discussion = discussions.find((d) => d.id === discussionId);
          
          const updateData: any = { status: data.status };
          
          if (data.status === "deleted") {
            const deletedAt = new Date();
            const permanentDeleteAt = new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
            updateData.deletedAt = deletedAt;
            updateData.permanentDeleteAt = permanentDeleteAt;
          }

          await prisma.discussion.update({
            where: { id: discussionId },
            data: updateData,
          });

          createAuditLogAsync({
            action: "discussion_status_changed",
            entityType: "discussion",
            entityId: discussionId,
            performedBy: currentUser.userId,
            performedByRole: currentUser.role,
            oldValue: { status: discussion?.status },
            newValue: { status: data.status },
            metadata: { 
              bulkAction: true,
              contentPreview: discussion?.content.substring(0, 100),
            },
            req,
          });

          return discussionId;
        })
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return NextResponse.json(
        successResponse(
          `${succeeded} comment(s) updated${failed > 0 ? `, ${failed} failed` : ""}`,
          { succeeded, failed }
        )
      );
    }

    if (action === "delete") {
      const results = await Promise.allSettled(
        validDiscussionIds.map(async (discussionId) => {
          const discussion = discussions.find((d) => d.id === discussionId);
          
          const deletedAt = new Date();
          const permanentDeleteAt = new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

          await prisma.discussion.update({
            where: { id: discussionId },
            data: {
              status: "deleted",
              deletedAt,
              permanentDeleteAt,
            },
          });

          createAuditLogAsync({
            action: "discussion_deleted",
            entityType: "discussion",
            entityId: discussionId,
            performedBy: currentUser.userId,
            performedByRole: currentUser.role,
            oldValue: { status: discussion?.status },
            newValue: { status: "deleted", deletedAt, permanentDeleteAt },
            metadata: { 
              bulkAction: true,
              userInitiated: true,
              contentPreview: discussion?.content.substring(0, 100),
            },
            req,
          });

          return discussionId;
        })
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return NextResponse.json(
        successResponse(
          `${succeeded} comment(s) deleted${failed > 0 ? `, ${failed} failed` : ""}`,
          { succeeded, failed }
        )
      );
    }

    return NextResponse.json(
      errorResponse("invalid_parameter", "Invalid action"),
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
