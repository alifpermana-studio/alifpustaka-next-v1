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
