import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Block /signin for signed-in users
  if (pathname.startsWith("/signin") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect /dashboard for non-signed-in users
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

// Specify which paths to run the middleware on
export const config = {
  matcher: ["/signin", "/dashboard/:path*"],
};
