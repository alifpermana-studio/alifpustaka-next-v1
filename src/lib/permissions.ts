import {
  UserRole,
  UserStatus,
  Permission,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  USER_ADMIN_ASSIGNABLE_ROLES,
  ADMIN_ROLES,
} from "@/types/roles";

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  // Define protected routes and their required permissions
  const routePermissions: Record<string, Permission> = {
    "/dashboard/users": "view_all_users",
    "/dashboard/posts": "manage_all_posts",
    "/dashboard/audit-logs": "view_all_audit_logs",
  };

  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true; // No specific permission required

  return hasPermission(role, requiredPermission);
}

/**
 * Check if current user can manage another user based on role hierarchy
 */
export function canManageUser(
  currentRole: UserRole,
  targetRole: UserRole
): boolean {
  // Super Admin can manage anyone
  if (currentRole === "super_admin") return true;

  // User Admin can manage non-admin users
  if (currentRole === "user_admin") {
    return !ADMIN_ROLES.includes(targetRole) && targetRole !== "super_admin";
  }

  // Others cannot manage users
  return false;
}

/**
 * Check if current user can assign a specific role
 */
export function canAssignRole(
  currentRole: UserRole,
  roleToAssign: UserRole
): boolean {
  // Super Admin can assign any role
  if (currentRole === "super_admin") return true;

  // User Admin can only assign specific roles
  if (currentRole === "user_admin") {
    return USER_ADMIN_ASSIGNABLE_ROLES.includes(roleToAssign);
  }

  // Others cannot assign roles
  return false;
}

/**
 * Check if user can manage user status (ban/unban)
 */
export function canManageUserStatus(
  role: UserRole,
  action: "ban" | "unban" | "activate" | "deactivate" | "delete"
): boolean {
  // Only Super Admin and User Admin can manage status
  if (role === "super_admin" || role === "user_admin") {
    return true;
  }

  return false;
}

/**
 * Check if user can publish posts
 */
export function canPublishPost(role: UserRole): boolean {
  return hasPermission(role, "publish_posts");
}

/**
 * Check if user can review posts
 * Special rule: Editor cannot review Content Admin posts
 */
export function canReviewPost(
  reviewerRole: UserRole,
  postAuthorRole: UserRole
): boolean {
  // Must have review permission
  if (!hasPermission(reviewerRole, "review_posts")) {
    return false;
  }

  // Editor cannot review Content Admin posts
  if (reviewerRole === "editor" && postAuthorRole === "content_admin") {
    return false;
  }

  // Super Admin and Content Admin can review anyone
  if (reviewerRole === "super_admin" || reviewerRole === "content_admin") {
    return true;
  }

  return true;
}

/**
 * Check if user can edit a specific post
 */
export function canEditPost(
  userId: string,
  postUserId: string,
  role: UserRole
): boolean {
  // Super Admin and Content Admin can edit any post
  if (role === "super_admin" || role === "content_admin") {
    return true;
  }

  // Users can edit their own posts if they have permission
  if (userId === postUserId) {
    return hasPermission(role, "edit_own_posts");
  }

  return false;
}

/**
 * Check if user can delete a specific post
 */
export function canDeletePost(
  userId: string,
  postUserId: string,
  role: UserRole
): boolean {
  // Super Admin and Content Admin can delete any post
  if (role === "super_admin" || role === "content_admin") {
    return true;
  }

  // Editors can delete posts if they have permission
  if (hasPermission(role, "delete_posts")) {
    return true;
  }

  // Users can delete their own posts if they have permission
  if (userId === postUserId && hasPermission(role, "delete_posts")) {
    return true;
  }

  return false;
}

/**
 * Check if user status allows actions
 */
export function isUserActive(status: UserStatus): boolean {
  return status === "active";
}

/**
 * Check if user can view audit logs
 */
export function canViewAuditLogs(
  role: UserRole,
  entityType?: "user" | "post" | "gallery"
): boolean {
  // Super Admin can view all audit logs
  if (hasPermission(role, "view_all_audit_logs")) {
    return true;
  }

  // Check entity-specific permissions
  if (entityType === "user" && hasPermission(role, "view_user_audit_logs")) {
    return true;
  }

  if (entityType === "post" && hasPermission(role, "view_post_audit_logs")) {
    return true;
  }

  // Everyone can view their own audit logs
  if (hasPermission(role, "view_own_audit_logs")) {
    return true;
  }

  return false;
}

/**
 * Check if user can manage public gallery
 */
export function canManagePublicGallery(role: UserRole): boolean {
  return hasPermission(role, "manage_public_gallery");
}

/**
 * Check if user can toggle gallery visibility
 */
export function canToggleGalleryVisibility(
  userId: string,
  galleryUserId: string,
  role: UserRole,
  currentVisibility: boolean,
  targetVisibility: boolean
): boolean {
  // Owner can always toggle their own gallery
  if (userId === galleryUserId) {
    return true;
  }

  // Content Admin can switch public -> private (moderation)
  if (
    role === "content_admin" &&
    currentVisibility === false && // currently public (isPrivate = false)
    targetVisibility === true // switching to private (isPrivate = true)
  ) {
    return true;
  }

  // Super Admin can do anything
  if (role === "super_admin") {
    return true;
  }

  return false;
}

/**
 * Compare role hierarchy levels
 */
export function compareRoleLevel(role1: UserRole, role2: UserRole): number {
  return ROLE_HIERARCHY[role1] - ROLE_HIERARCHY[role2];
}

/**
 * Check if role1 has higher or equal level than role2
 */
export function hasHigherOrEqualRole(role1: UserRole, role2: UserRole): boolean {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
}
