// User Role Types
export type UserRole = 
  | 'super_admin'
  | 'content_admin'
  | 'user_admin'
  | 'sales_admin'
  | 'support_admin'
  | 'editor'
  | 'author'
  | 'user';

// User Status Types
export type UserStatus = 
  | 'active'
  | 'inactive'
  | 'banned'
  | 'deleted';

// Permission Types
export type Permission =
  | 'manage_all_users'
  | 'manage_user_roles'
  | 'manage_user_status'
  | 'view_all_users'
  | 'view_deleted_users'
  | 'manage_all_posts'
  | 'publish_posts'
  | 'review_posts'
  | 'edit_own_posts'
  | 'submit_posts'
  | 'delete_posts'
  | 'manage_public_gallery'
  | 'manage_own_gallery'
  | 'view_all_audit_logs'
  | 'view_user_audit_logs'
  | 'view_post_audit_logs'
  | 'view_own_audit_logs';

// Role Hierarchy - Higher number = more privileges
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  content_admin: 80,
  user_admin: 80,
  sales_admin: 80,
  support_admin: 80,
  editor: 60,
  author: 40,
  user: 10,
};

// Role Permissions Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'manage_all_users',
    'manage_user_roles',
    'manage_user_status',
    'view_all_users',
    'view_deleted_users',
    'manage_all_posts',
    'publish_posts',
    'review_posts',
    'edit_own_posts',
    'submit_posts',
    'delete_posts',
    'manage_public_gallery',
    'manage_own_gallery',
    'view_all_audit_logs',
    'view_user_audit_logs',
    'view_post_audit_logs',
    'view_own_audit_logs',
  ],
  content_admin: [
    'manage_all_posts',
    'publish_posts',
    'review_posts',
    'edit_own_posts',
    'submit_posts',
    'delete_posts',
    'manage_public_gallery',
    'manage_own_gallery',
    'view_post_audit_logs',
    'view_own_audit_logs',
  ],
  user_admin: [
    'manage_user_roles', // Limited to non-admin roles
    'manage_user_status',
    'view_all_users',
    'view_deleted_users',
    'view_user_audit_logs',
    'view_own_audit_logs',
    'manage_own_gallery',
    'edit_own_posts',
  ],
  sales_admin: [
    'manage_own_gallery',
    'edit_own_posts',
    'view_own_audit_logs',
  ],
  support_admin: [
    'manage_own_gallery',
    'edit_own_posts',
    'view_own_audit_logs',
  ],
  editor: [
    'publish_posts',
    'review_posts',
    'edit_own_posts',
    'submit_posts',
    'delete_posts',
    'manage_own_gallery',
    'view_own_audit_logs',
  ],
  author: [
    'edit_own_posts',
    'submit_posts',
    'manage_own_gallery',
    'view_own_audit_logs',
  ],
  user: [
    'manage_own_gallery',
    'view_own_audit_logs',
  ],
};

// Roles that User Admin can assign
export const USER_ADMIN_ASSIGNABLE_ROLES: UserRole[] = [
  'user',
  'author',
  'editor',
];

// Admin-level roles (only Super Admin can assign)
export const ADMIN_ROLES: UserRole[] = [
  'content_admin',
  'user_admin',
  'sales_admin',
  'support_admin',
];

// Post roles (roles that can interact with posts)
export const POST_ROLES: UserRole[] = [
  'super_admin',
  'content_admin',
  'editor',
  'author',
];

// Gallery roles (roles that can interact with gallery)
export const GALLERY_ROLES: UserRole[] = [
  'super_admin',
  'content_admin',
  'user_admin',
  'sales_admin',
  'support_admin',
  'editor',
  'author',
  'user',
];
