import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStatus } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";
import { notifyCommentStatusChanged } from "@/lib/notifications";
import * as permissions from "@/lib/permissions";
import { DiscussionStatus } from "@/types/discussion";

export async function PATCH(
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        errorResponse("validation_error", "Status is required"),
        { status: 400 }
      );
    }

    const validStatuses: DiscussionStatus[] = ["pending", "published", "banned", "deleted"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        errorResponse("validation_error", "Invalid status"),
        { status: 400 }
      );
    }

    const existingDiscussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: {
        id: true,
        content: true,
        status: true,
        userId: true,
        sourceType: true,
        sourceId: true,
      },
    });

    if (!existingDiscussion) {
      return NextResponse.json(
        errorResponse("not_found", "Comment not found"),
        { status: 404 }
      );
    }

    if (existingDiscussion.status === status) {
      return NextResponse.json(
        errorResponse("invalid_request", "Comment already has this status"),
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
    };

    if (status === "deleted") {
      const deletedAt = new Date();
      const permanentDeleteAt = new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      updateData.deletedAt = deletedAt;
      updateData.permanentDeleteAt = permanentDeleteAt;
    }

    const updatedDiscussion = await prisma.discussion.update({
      where: { id: discussionId },
      data: updateData,
    });

    createAuditLogAsync({
      action: "discussion_status_changed",
      entityType: "discussion",
      entityId: discussionId,
      performedBy: currentUser.userId,
      performedByRole: currentUser.role,
      oldValue: { status: existingDiscussion.status },
      newValue: { status },
      metadata: { 
        adminAction: true,
        contentPreview: existingDiscussion.content.substring(0, 100),
      },
      req,
    });

    await notifyCommentStatusChanged(
      existingDiscussion.userId,
      existingDiscussion.content,
      existingDiscussion.status,
      status,
      discussionId
    );

    return NextResponse.json(
      successResponse("Comment status updated successfully", {
        id: updatedDiscussion.id,
        status: updatedDiscussion.status,
        updatedAt: updatedDiscussion.updatedAt,
      })
    );
  } catch (error) {
    console.error("Error updating discussion status:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to update comment status"),
      { status: 500 }
    );
  }
}
