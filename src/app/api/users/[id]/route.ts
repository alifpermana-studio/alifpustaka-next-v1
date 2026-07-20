import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthorization } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getUserAuditLogs } from "@/lib/audit-log";

/**
 * GET /api/users/[id]
 * Get user details with recent audit logs
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthorization(req, {
    requireActive: true,
  });

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const { id: userId } = await params;

  // Check permissions: User Admin, Super Admin, or self
  const isSelf = authResult.user.userId === userId;
  const canViewAllUsers = authResult.user.role === "super_admin" || authResult.user.role === "user_admin";

  if (!isSelf && !canViewAllUsers) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        "You can only view your own profile"
      ),
      { status: 403 }
    );
  }

  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse("not_found", "User not found"),
        { status: 404 }
      );
    }

    // Get recent audit logs (last 20)
    const auditLogs = await getUserAuditLogs(userId, 20);

    return NextResponse.json(
      successResponse("User details retrieved successfully", {
        user,
        auditLogs,
      })
    );
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch user details"),
      { status: 500 }
    );
  }
}
