import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthorization } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthorization(req, {
    requireActive: true,
  });

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  try {
    const { id: notificationId } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true, isRead: true },
    });

    if (!notification) {
      return NextResponse.json(
        errorResponse("not_found", "Notification not found"),
        { status: 404 }
      );
    }

    if (notification.userId !== authResult.user.userId) {
      return NextResponse.json(
        errorResponse("insufficient_permissions", "Access denied"),
        { status: 403 }
      );
    }

    if (!notification.isRead) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      successResponse("Notification marked as read", null)
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to update notification"),
      { status: 500 }
    );
  }
}
