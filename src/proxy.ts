import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserRole, ADMIN_ROLES } from "@/types/roles";

const PROTECTED_ROUTES = ["/dashboard", "/p", "/settings", "/post", "/gallery", "/admin"];
const AUTH_ROUTES = ["/signin", "/signup", "/forgot-password", "/verify-email"];

const hasUserPermission = (role: UserRole, permission: string): boolean => {
  if (permission === "view_all_users") {
    return role === "super_admin" || role === "user_admin";
  }
  return false;
};

const isAdminRole = (role: UserRole): boolean => {
  return ADMIN_ROLES.includes(role) || role === "super_admin";
};

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  console.log("Proxy middleware pathname:", pathname);

  // Auth and permission checks
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("Proxy middleware session:", session);

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthRoute && session) {
    // Redirect to dashboard after login
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/p" || (pathname === "/profile" && session)) {
    if (session && (session.user as any).username) {
      return NextResponse.redirect(
        new URL(`/p/${(session.user as any).username || session.user.id}`, request.url),
      );
    }
  }

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  
  if (isAdminRoute && session) {
    const userRole = (session.user as any).role as UserRole;
    
    if (!isAdminRole(userRole)) {
      return NextResponse.redirect(
        new URL(`/p/${(session.user as any).username || session.user.id}`, request.url)
      );
    }
    
    if (pathname === "/admin/user-management" || pathname.startsWith("/admin/user-management/")) {
      const canViewUsers = hasUserPermission(userRole, "view_all_users");
      
      if (!canViewUsers) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
