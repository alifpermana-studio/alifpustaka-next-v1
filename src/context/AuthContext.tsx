"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth.client";
import { AuthContextType, User } from "@/types/auth";
import { UserRole, UserStatus, Permission } from "@/types/roles";
import * as permissions from "@/lib/permissions";
import { LoaderCircle } from "lucide-react";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const PROTECTED_ROUTES = ["/p", "/dashboard", "/settings", "/blog", "/gallery"];
const AUTH_ROUTES = ["/signin", "/signup"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, isPending, error } = authClient.useSession();

  const user: User | null = session?.user
    ? {
        userId: session.user.id,
        name: session.user.name,
        username: session.user.username || "",
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image ?? null,
        role: ((session.user as any).role as UserRole) || "user",
        status: ((session.user as any).status as UserStatus) || "active",
      }
    : null;

  const isAuthenticated = !!user;

  const signOut = async () => {
    try {
      await authClient.signOut();
      router.push("/signin");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const updateUser = async () => {
    try {
      await authClient.$fetch("/session");
    } catch (err) {
      console.error("Session refresh error:", err);
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return permissions.hasPermission(user.role, permission);
  };

  const isActive = (): boolean => {
    if (!user) return false;
    return permissions.isUserActive(user.status);
  };

  const canManageUser = (targetRole: UserRole): boolean => {
    if (!user) return false;
    return permissions.canManageUser(user.role, targetRole);
  };

  useEffect(() => {
    if (isPending) return;

    // Check if user is not active (banned, inactive, deleted)
    if (user && !isActive()) {
      signOut();
      router.push("/signin?error=account_inactive");
      return;
    }

    if (!user && isProtectedRoute(pathname)) {
      router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user && isAuthRoute(pathname)) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get("redirect") || "/p";
      router.push(redirect);
    }
  }, [isPending, user, pathname, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    isLoading: isPending,
    isAuthenticated,
    error: error || null,
    signOut,
    updateUser,
    hasRole,
    hasPermission,
    isActive,
    canManageUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
