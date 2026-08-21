import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/invite"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  if (!request.cookies.get("access_token")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, Next internals, and the API rewrite so it isn't gated by the cookie check.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
