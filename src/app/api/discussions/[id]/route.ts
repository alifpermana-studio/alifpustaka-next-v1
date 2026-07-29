import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;
  const discussionId = id;

  try {
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        errorResponse("validation_error", "Content is required"),
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

    // Get existing discussion
    const existingDiscussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: {
        id: true,
        userId: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });

    if (!existingDiscussion) {
      return NextResponse.json(
        errorResponse("not_found", "Comment not found"),
        { status: 404 },
      );
    }

    // Check ownership
    if (existingDiscussion.userId !== currentUser.userId) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You can only edit your own comments",
        ),
        { status: 403 },
      );
    }

    // Check if comment is deleted or banned
    if (
      existingDiscussion.status === "deleted" ||
      existingDiscussion.status === "banned"
    ) {
      return NextResponse.json(
        errorResponse(
          "invalid_request",
          "Cannot edit deleted or banned comments",
        ),
        { status: 400 },
      );
    }

    // Check 30-minute time limit
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (existingDiscussion.createdAt < thirtyMinutesAgo) {
      return NextResponse.json(
        errorResponse(
          "invalid_request",
          "Edit time limit (30 minutes) has expired",
        ),
        { status: 400 },
      );
    }

    // Update discussion
    const updatedDiscussion = await prisma.discussion.update({
      where: { id: discussionId },
      data: {
        content: content.trim(),
        editedAt: new Date(),
        editCount: { increment: 1 },
      },
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
    });

    createAuditLogAsync({
      action: "discussion_edited",
      entityType: "discussion",
      entityId: discussionId,
      performedBy: currentUser.userId,
      performedByRole: currentUser.role,
      oldValue: { content: existingDiscussion.content },
      newValue: { content: content.trim() },
      metadata: { editCount: updatedDiscussion.editCount },
      req,
    });

    return NextResponse.json(
      successResponse("Comment updated successfully", {
        id: updatedDiscussion.id,
        content: updatedDiscussion.content,
        editedAt: updatedDiscussion.editedAt,
        editCount: updatedDiscussion.editCount,
        updatedAt: updatedDiscussion.updatedAt,
      }),
    );
  } catch (error) {
    console.error("Error updating discussion:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to update comment"),
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const currentUser = authResult.user;
  const discussionId = id;

  try {
    // Get existing discussion
    const existingDiscussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: {
        id: true,
        userId: true,
        content: true,
        status: true,
      },
    });

    if (!existingDiscussion) {
      return NextResponse.json(
        errorResponse("not_found", "Comment not found"),
        { status: 404 },
      );
    }

    // Check ownership
    if (existingDiscussion.userId !== currentUser.userId) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You can only delete your own comments",
        ),
        { status: 403 },
      );
    }

    // Check if already deleted
    if (existingDiscussion.status === "deleted") {
      return NextResponse.json(
        errorResponse("invalid_request", "Comment is already deleted"),
        { status: 400 },
      );
    }

    // Soft delete: set status to deleted and schedule permanent deletion
    const deletedAt = new Date();
    const permanentDeleteAt = new Date(
      deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 days from now

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
      oldValue: { status: existingDiscussion.status },
      newValue: { status: "deleted", deletedAt, permanentDeleteAt },
      metadata: { userInitiated: true },
      req,
    });

    return NextResponse.json(
      successResponse(
        "Comment deleted successfully. It will be permanently removed after 30 days.",
        {
          id: discussionId,
          status: "deleted",
          deletedAt,
          permanentDeleteAt,
        },
      ),
    );
  } catch (error) {
    console.error("Error deleting discussion:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to delete comment"),
      { status: 500 },
    );
  }
}
