// middleware.ts (Fixed unused variables and improved logic)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  // Define route categories
  const protectedRoutes = ["/profile", "/dashboard", "/admin", "/settings"];
  // const publicRoutes = [
  //   "/",
  //   "/login",
  //   "/signup",
  //   "/about",
  //   "/contact",
  //   "/verify-email",
  // ];
  const authRoutes = ["/login", "/signup"];

  // Check route types
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  // const isPublicRoute = publicRoutes.some(
  //   (route) =>
  //     pathname === route || (route !== "/" && pathname.startsWith(route))
  // );
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    const redirectTo =
      request.nextUrl.searchParams.get("redirect") || "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // For admin routes and other role-based access, let the component handle it
  // since we can't easily verify JWT and check roles in middleware

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
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
