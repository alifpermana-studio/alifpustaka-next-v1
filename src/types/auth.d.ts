import { UserRole, UserStatus, Permission } from "./roles";

export interface User {
  userId: string; // for system use only
  name: string;
  username?: string | null | undefined;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  role: UserRole;
  status: UserStatus;
}

export interface Session {
  session: UserSession;
  user: User;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  updateUser: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  isActive: () => boolean;
  canManageUser: (targetRole: UserRole) => boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
