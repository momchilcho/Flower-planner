import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ["/plans", "/plans/"];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Also protect /design/[planId] but not /design itself (guest access allowed)
  const isProtectedDesign = pathname.startsWith("/design/") && pathname !== "/design";

  if (isProtected || isProtectedDesign) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Add rate limiting headers for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/plans/:path*",
    "/design/:path+",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|textures|public).*)",
  ],
};
