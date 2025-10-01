import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset",
  "/verify",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/request-reset",
  "/api/auth/reset",
  "/api/auth/verify",
];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  // Allow Next internal and static
  if (pathname.startsWith("/_next") || pathname.startsWith("/public") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }
  // Public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  // Simple cookie presence check (no DB/JWT in Edge)
  const token = req.cookies.get("session")?.value;
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
