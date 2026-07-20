import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserRole, Permission } from "@/types/roles";
import { User, Session } from "@/types/auth";
import { errorResponse } from "@/lib/api-response";
import * as permissions from "@/lib/permissions";

export interface AuthResult {
  authorized: boolean;
  user: User | null;
  session: any;
  response?: NextResponse;
}

/**
 * Basic authentication check - ensures user is logged in
 */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      authorized: false,
      user: null,
      session: null,
      response: NextResponse.json(
        errorResponse("unauthorized", "Authentication required"),
        { status: 401 }
      ),
    };
  }

  // Check if session is expired
  if (
    typeof session.session.expiresAt === "number" &&
    session.session.expiresAt <= Date.now()
  ) {
    return {
      authorized: false,
      user: null,
      session: null,
      response: NextResponse.json(
        errorResponse("session_expired", "Your session has expired"),
        { status: 401 }
      ),
    };
  }

  const user: User = {
    userId: session.user.id,
    name: session.user.name,
    username: session.user.username || "",
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    image: session.user.image ?? null,
    role: ((session.user as any).role as UserRole) || "user",
    status: ((session.user as any).status as any) || "active",
  };

  return {
    authorized: true,
    user,
    session,
  };
}

/**
 * Check if user has active status
 */
export async function requireActiveStatus(
  req: NextRequest
): Promise<AuthResult> {
  const authResult = await requireAuth(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult;
  }

  const user = authResult.user;

  if (!permissions.isUserActive(user.status)) {
    let errorCode: "account_inactive" | "account_banned" | "account_deleted" =
      "account_inactive";
    let errorMessage = "Your account is not active";

    if (user.status === "banned") {
      errorCode = "account_banned";
      errorMessage = "Your account has been banned";
    } else if (user.status === "deleted") {
      errorCode = "account_deleted";
      errorMessage = "Your account has been deleted";
    }

    return {
      authorized: false,
      user,
      session: authResult.session,
      response: NextResponse.json(errorResponse(errorCode, errorMessage), {
        status: 403,
      }),
    };
  }

  return authResult;
}

/**
 * Check if user has one of the required roles
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult;
  }

  const user = authResult.user;

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      user,
      session: authResult.session,
      response: NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          `This action requires one of the following roles: ${allowedRoles.join(", ")}`
        ),
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Check if user has a specific permission
 */
export async function requirePermission(
  req: NextRequest,
  permission: Permission
): Promise<AuthResult> {
  const authResult = await requireActiveStatus(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult;
  }

  const user = authResult.user;

  if (!permissions.hasPermission(user.role, permission)) {
    return {
      authorized: false,
      user,
      session: authResult.session,
      response: NextResponse.json(
        errorResponse(
          "insufficient_permissions",
          `You do not have the required permission: ${permission}`
        ),
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Combined authorization check with multiple options
 */
export async function requireAuthorization(
  req: NextRequest,
  options: {
    roles?: UserRole[];
    permissions?: Permission[];
    requireActive?: boolean;
  }
): Promise<AuthResult> {
  const { roles, permissions: requiredPermissions, requireActive = true } = options;

  // Basic auth check
  const authResult = requireActive
    ? await requireActiveStatus(req)
    : await requireAuth(req);

  if (!authResult.authorized || !authResult.user) {
    return authResult;
  }

  const user = authResult.user;

  // Check roles if specified
  if (roles && roles.length > 0) {
    if (!roles.includes(user.role)) {
      return {
        authorized: false,
        user,
        session: authResult.session,
        response: NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            `This action requires one of the following roles: ${roles.join(", ")}`
          ),
          { status: 403 }
        ),
      };
    }
  }

  // Check permissions if specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((perm) =>
      permissions.hasPermission(user.role, perm)
    );

    if (!hasAllPermissions) {
      return {
        authorized: false,
        user,
        session: authResult.session,
        response: NextResponse.json(
          errorResponse(
            "insufficient_permissions",
            "You do not have the required permissions for this action"
          ),
          { status: 403 }
        ),
      };
    }
  }

  return authResult;
}
