import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthorization } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { parseAuditValue } from "@/lib/audit-log";
import * as permissions from "@/lib/permissions";

/**
 * GET /api/audit-logs/[id]
 * Get specific audit log entry
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

  const { id: auditLogId } = await params;
  const currentUser = authResult.user;

  try {
    const auditLog = await prisma.auditLog.findUnique({
      where: { id: auditLogId },
    });

    if (!auditLog) {
      return NextResponse.json(
        errorResponse("not_found", "Audit log not found"),
        { status: 404 }
      );
    }

    // Check permissions based on entity type and role
    const canViewAll = permissions.hasPermission(
      currentUser.role,
      "view_all_audit_logs"
    );
    const canViewUserLogs = permissions.hasPermission(
      currentUser.role,
      "view_user_audit_logs"
    );
    const canViewPostLogs = permissions.hasPermission(
      currentUser.role,
      "view_post_audit_logs"
    );

    // Check if user has permission to view this specific log
    let hasPermission = false;

    if (canViewAll) {
      hasPermission = true;
    } else if (
      canViewUserLogs &&
      auditLog.entityType === "user"
    ) {
      hasPermission = true;
    } else if (
      canViewPostLogs &&
      auditLog.entityType === "post"
    ) {
      hasPermission = true;
    } else if (
      auditLog.performedBy === currentUser.userId ||
      (auditLog.entityType === "user" && auditLog.entityId === currentUser.userId)
    ) {
      // User can view their own audit logs
      hasPermission = true;
    }

    if (!hasPermission) {
      return NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          "You do not have permission to view this audit log"
        ),
        { status: 403 }
      );
    }

    // Parse JSON values for better readability
    const parsedLog = {
      ...auditLog,
      oldValue: parseAuditValue(auditLog.oldValue),
      newValue: parseAuditValue(auditLog.newValue),
    };

    return NextResponse.json(
      successResponse("Audit log retrieved successfully", parsedLog)
    );
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch audit log"),
      { status: 500 }
    );
  }
}
