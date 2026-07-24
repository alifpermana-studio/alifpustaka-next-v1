import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthorization } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAuditLogAsync } from "@/lib/audit-log";
import { UserRole, UserStatus } from "@/types/roles";
import * as permissions from "@/lib/permissions";
import { notifyUserRoleChange, notifyUserStatusChange } from "@/lib/notifications";

/**
 * GET /api/users
 * List all users (User Admin and Super Admin only)
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAuthorization(req, {
    permissions: ["view_all_users"],
  });

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") as UserRole | null;
  const status = searchParams.get("status") as UserStatus | null;
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const where: any = {};

    // Search by name, username, or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(
      successResponse(
        `Found ${users.length} user(s)`,
        users,
        {
          pagination: {
            total,
            skip,
            limit,
            hasMore: skip + limit < total,
          },
        }
      )
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to fetch users"),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Update user role and/or status
 */
export async function PATCH(req: NextRequest) {
  const authResult = await requireAuthorization(req, {
    requireActive: true,
  });

  if (!authResult.authorized || !authResult.user) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json(
        errorResponse("missing_parameter", "User ID is required"),
        { status: 400 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        errorResponse("not_found", "User not found"),
        { status: 404 }
      );
    }

    const updates: any = {};
    const oldValues: any = {};
    const newValues: any = {};

    // Handle role change
    if (role && role !== targetUser.role) {
      // Check if current user can assign this role
      if (!permissions.canAssignRole(authResult.user.role, role as UserRole)) {
        return NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            authResult.user.role === "user_admin"
              ? `User Admin can only assign: user, author, editor roles`
              : `You cannot assign roles`
          ),
          { status: 403 }
        );
      }

      // Check if current user can manage target user
      if (!permissions.canManageUser(authResult.user.role, targetUser.role as UserRole)) {
        return NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            "You cannot manage users with this role"
          ),
          { status: 403 }
        );
      }

      updates.role = role;
      oldValues.role = targetUser.role;
      newValues.role = role;
    }

    // Handle status change
    if (status && status !== targetUser.status) {
      // Check if current user can manage status
      if (!permissions.canManageUserStatus(authResult.user.role, "ban")) {
        return NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            "Only Super Admin and User Admin can change user status"
          ),
          { status: 403 }
        );
      }

      updates.status = status;
      oldValues.status = targetUser.status;
      newValues.status = status;
    }

    // If no updates, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        errorResponse("invalid_parameter", "No valid updates provided"),
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
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

    // Create audit logs
    if (updates.role) {
      createAuditLogAsync({
        action: "user_role_change",
        entityType: "user",
        entityId: userId,
        performedBy: authResult.user.userId,
        performedByRole: authResult.user.role,
        oldValue: { role: oldValues.role },
        newValue: { role: newValues.role },
        metadata: {
          targetUserEmail: targetUser.email,
          targetUserName: targetUser.name,
        },
        req,
      });
    }

    if (updates.status) {
      createAuditLogAsync({
        action: "user_status_change",
        entityType: "user",
        entityId: userId,
        performedBy: authResult.user.userId,
        performedByRole: authResult.user.role,
        oldValue: { status: oldValues.status },
        newValue: { status: newValues.status },
        metadata: {
          targetUserEmail: targetUser.email,
          targetUserName: targetUser.name,
        },
        req,
      });

      notifyUserStatusChange(
        userId,
        updatedUser.username || updatedUser.email,
        oldValues.status,
        newValues.status
      );
    }

    if (updates.role) {
      notifyUserRoleChange(userId, oldValues.role, newValues.role);
    }

    return NextResponse.json(
      successResponse("User updated successfully", updatedUser)
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      errorResponse("internal_error", "Failed to update user"),
      { status: 500 }
    );
  }
}
