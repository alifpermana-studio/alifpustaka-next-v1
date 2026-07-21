import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserRole, ADMIN_ROLES } from "@/types/roles";

const PROTECTED_ROUTES = ["/dashboard", "/p", "/settings", "/blog", "/gallery", "/admin"];
const AUTH_ROUTES = ["/signin", "/signup", "/forgot-password", "/verify-email"];
const PUBLIC_ROUTES = ["/about", "/contact", "/terms", "/privacy"];

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const pathname = request.nextUrl.pathname;

  console.log("Proxy middleware session:", session);
  console.log("Proxy middleware pathname:", pathname);

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthRoute && session) {
    // Redirect them to their main landing page (e.g., /dashboard)
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/p" || (pathname === "/profile" && session)) {
    if (session?.user.username) {
      return NextResponse.redirect(
        new URL(`/p/${session.user.username || session.user.id}`, request.url),
      );
    }
  }

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  
  if (isAdminRoute && session) {
    const userRole = (session.user as any).role as UserRole;
    
    if (!isAdminRole(userRole)) {
      return NextResponse.redirect(
        new URL(`/p/${session.user.username || session.user.id}`, request.url)
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
