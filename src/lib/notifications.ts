import { CreateNotificationParams } from "@/types/notification";
import { prisma } from "@/lib/prisma";

export async function createNotification(params: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        id: require('uuid').v4(),
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        linkTo: params.linkTo,
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

export async function notifyUserRoleChange(
  userId: string,
  oldRole: string,
  newRole: string,
) {
  await createNotification({
    userId,
    type: "role_change",
    title: "Role Updated",
    message: `Your role has been changed from ${oldRole} to ${newRole}`,
    linkTo: `/p`,
    relatedEntityType: "user",
    relatedEntityId: userId,
  });
}

export async function notifyUserStatusChange(
  userId: string,
  username: string,
  oldStatus: string,
  newStatus: string,
) {
  const statusMessages: Record<string, string> = {
    active: "Your account is now active",
    inactive: "Your account has been deactivated",
    banned: "Your account has been banned",
  };

  await createNotification({
    userId,
    type: "status_change",
    title: "Account Status Changed",
    message: statusMessages[newStatus] || `Your status is now ${newStatus}`,
    linkTo: `/p/${username}`,
    relatedEntityType: "user",
    relatedEntityId: userId,
  });
}

export async function notifyPostApproved(
  userId: string,
  postTitle: string,
  postId: string,
) {
  await createNotification({
    userId,
    type: "post_approved",
    title: "Post Approved",
    message: `Your post "${postTitle}" has been published`,
    linkTo: "/posts",
    relatedEntityType: "post",
    relatedEntityId: postId,
  });
}

export async function notifyPostRejected(
  userId: string,
  postTitle: string,
  postId: string,
) {
  await createNotification({
    userId,
    type: "post_rejected",
    title: "Post Needs Revision",
    message: `Your post "${postTitle}" has been sent back for revision`,
    linkTo: "/posts",
    relatedEntityType: "post",
    relatedEntityId: postId,
  });
}

export async function notifyCommentReply(
  userId: string,
  commenterName: string,
  commentId: string,
  sourceTitle: string,
) {
  await createNotification({
    userId,
    type: "comment_reply",
    title: "New Reply to Your Comment",
    message: `${commenterName} replied to your comment on "${sourceTitle}"`,
    linkTo: "/discussions",
    relatedEntityType: "discussion",
    relatedEntityId: commentId,
  });
}

export async function notifyCommentStatusChanged(
  userId: string,
  commentContent: string,
  oldStatus: string,
  newStatus: string,
  commentId: string,
) {
  const statusMessages: Record<string, string> = {
    published: "Your comment has been approved and is now published",
    banned: "Your comment has been removed for violating community guidelines",
    deleted: "Your comment has been deleted",
    pending: "Your comment is pending review",
  };

  const truncatedContent = commentContent.length > 50 
    ? commentContent.substring(0, 50) + "..." 
    : commentContent;

  await createNotification({
    userId,
    type: "comment_status_changed",
    title: "Comment Status Updated",
    message: `${statusMessages[newStatus] || `Your comment status changed to ${newStatus}`}: "${truncatedContent}"`,
    linkTo: "/discussions",
    relatedEntityType: "discussion",
    relatedEntityId: commentId,
  });
}
