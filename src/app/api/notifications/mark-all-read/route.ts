import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthorization } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all user notifications as read
 */
export async function PATCH(req: NextRequest) {
  const authResult = await requireAuthorization(req, {
    requireActive: true,
  });

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: authResult.user.userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(
      successResponse("All notifications marked as read", null)
    );
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to update notifications"),
      { status: 500 }
    );
  }
}
