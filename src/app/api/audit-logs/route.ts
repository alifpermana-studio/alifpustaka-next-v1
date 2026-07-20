import { NextRequest, NextResponse } from "next/server";
import { requireAuthorization } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getAuditLogs } from "@/lib/audit-log";
import { AuditAction, EntityType } from "@/types/audit";
import * as permissions from "@/lib/permissions";

/**
 * GET /api/audit-logs
 * List audit logs with role-based filtering
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAuthorization(req, {
    requireActive: true,
  });

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType") as EntityType | null;
  const entityId = searchParams.get("entityId") || undefined;
  const action = searchParams.get("action") as AuditAction | null;
  const performedBy = searchParams.get("performedBy") || undefined;
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : undefined;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : undefined;
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const currentUser = authResult.user;

  // Check permissions based on role and entity type
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

  // Apply role-based filtering
  let allowedEntityTypes: EntityType[] = [];

  if (canViewAll) {
    // Super Admin can view all
    allowedEntityTypes = ["user", "post", "gallery"];
  } else {
    // Filter by specific permissions
    if (canViewUserLogs) allowedEntityTypes.push("user");
    if (canViewPostLogs) allowedEntityTypes.push("post");
  }

  // If user can only view their own logs
  if (
    !canViewAll &&
    !canViewUserLogs &&
    !canViewPostLogs &&
    permissions.hasPermission(currentUser.role, "view_own_audit_logs")
  ) {
    // Only show logs where user is the performer or the subject
    try {
      const filters = {
        entityType: entityType || undefined,
        entityId,
        action: action || undefined,
        performedBy: currentUser.userId, // Force to current user
        startDate,
        endDate,
        skip,
        limit,
      };

      const result = await getAuditLogs(filters);

      return NextResponse.json(
        successResponse(`Found ${result.logs.length} audit log(s)`, result.logs, {
          pagination: {
            total: result.total,
            skip: result.skip,
            limit: result.limit,
            hasMore: result.skip + result.limit < result.total,
          },
        })
      );
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return NextResponse.json(
        errorResponse("internal_error", "Failed to fetch audit logs"),
        { status: 500 }
      );
    }
  }

  // Check if requested entity type is allowed
  if (entityType && !allowedEntityTypes.includes(entityType)) {
    return NextResponse.json(
      errorResponse(
        "insufficient_permissions",
        `You do not have permission to view ${entityType} audit logs`
      ),
      { status: 403 }
    );
  }

  try {
    const filters = {
      entityType: entityType || undefined,
      entityId,
      action: action || undefined,
      performedBy,
      startDate,
      endDate,
      skip,
      limit,
    };

    const result = await getAuditLogs(filters);

    return NextResponse.json(
      successResponse(`Found ${result.logs.length} audit log(s)`, result.logs, {
        pagination: {
          total: result.total,
          skip: result.skip,
          limit: result.limit,
          hasMore: result.skip + result.limit < result.total,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch audit logs"),
      { status: 500 }
    );
  }
}
