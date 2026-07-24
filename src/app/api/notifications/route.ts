import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthorization } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * GET /api/notifications
 * Fetch user's notifications (latest 5 by default)
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAuthorization(req, {
    requireActive: true,
  });

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "5", 10);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  try {
    const where: any = {
      userId: authResult.user.userId,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: {
          userId: authResult.user.userId,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json(
      successResponse("Notifications fetched successfully", {
        notifications,
        unreadCount,
      })
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch notifications"),
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (system/admin use)
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAuthorization(req, {
    requireActive: true,
  });

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const { userId, type, title, message, linkTo, relatedEntityType, relatedEntityId } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        errorResponse("missing_parameter", "Missing required fields"),
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        linkTo,
        relatedEntityType,
        relatedEntityId,
      },
    });

    return NextResponse.json(
      successResponse("Notification created successfully", notification)
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to create notification"),
      { status: 500 }
    );
  }
}
