import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/api/auth", "/api"];

export async function proxy(request: NextRequest) {
  // DEV BYPASS: skip auth check until Microsoft OAuth is configured
  // TODO: Remove this bypass once MICROSOFT_CLIENT_ID is set in env
  if (!process.env.MICROSOFT_CLIENT_ID) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // Check for session cookie
  // BetterAuth uses "__Secure-better-auth.session_token" in production (https)
  // and "better-auth.session_token" in development (http)
  const sessionToken =
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
