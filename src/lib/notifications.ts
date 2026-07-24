import { CreateNotificationParams } from "@/types/notification";
import { prisma } from "@/lib/prisma";

export async function createNotification(params: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
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
  newRole: string
) {
  await createNotification({
    userId,
    type: "role_change",
    title: "Role Updated",
    message: `Your role has been changed from ${oldRole} to ${newRole}`,
    linkTo: undefined,
    relatedEntityType: "user",
    relatedEntityId: userId,
  });
}

export async function notifyUserStatusChange(
  userId: string,
  username: string,
  oldStatus: string,
  newStatus: string
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
  postId: string
) {
  await createNotification({
    userId,
    type: "post_approved",
    title: "Post Approved",
    message: `Your post "${postTitle}" has been published`,
    linkTo: "/blog",
    relatedEntityType: "post",
    relatedEntityId: postId,
  });
}

export async function notifyPostRejected(
  userId: string,
  postTitle: string,
  postId: string
) {
  await createNotification({
    userId,
    type: "post_rejected",
    title: "Post Needs Revision",
    message: `Your post "${postTitle}" has been sent back for revision`,
    linkTo: "/blog",
    relatedEntityType: "post",
    relatedEntityId: postId,
  });
}
