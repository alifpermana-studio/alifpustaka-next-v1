import { NextRequest, NextResponse } from "next/server";
import { requireAuthorization } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getUserAuditLogs } from "@/lib/audit-log";
import * as permissions from "@/lib/permissions";

/**
 * GET /api/users/[id]/audit-logs
 * Get audit logs for a specific user
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
  const currentUser = authResult.user;

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  // Check permissions: Super Admin, User Admin, or self
  const isSelf = currentUser.userId === userId;
  const canViewUserLogs =
    permissions.hasPermission(currentUser.role, "view_all_audit_logs") ||
    permissions.hasPermission(currentUser.role, "view_user_audit_logs");

  if (!isSelf && !canViewUserLogs) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        "You can only view your own audit logs"
      ),
      { status: 403 }
    );
  }

  try {
    const auditLogs = await getUserAuditLogs(userId, limit);

    return NextResponse.json(
      successResponse(
        `Found ${auditLogs.length} audit log(s) for user`,
        auditLogs
      )
    );
  } catch (error) {
    console.error("Error fetching user audit logs:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch user audit logs"),
      { status: 500 }
    );
  }
}
