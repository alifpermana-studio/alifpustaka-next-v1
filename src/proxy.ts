import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const PROTECTED_ROUTES = ["/dashboard", "/p", "/settings", "/blog", "/gallery"];
// 1. Define routes that only unauthenticated guests should see
const AUTH_ROUTES = ["/signin", "/signup", "/forgot-password", "/verify-email"];
// 2. Define routes that are accessible to everyone, regardless of authentication status
const PUBLIC_ROUTES = ["/about", "/contact", "/terms", "/privacy"];

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

  if (pathname === "/p" && session) {
    if (session.user.username) {
      return NextResponse.redirect(
        new URL(`/p/${session.user.username || session.user.id}`, request.url),
      );
    }
  }

  // Allow the request to proceed normally if conditions are met
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
