import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/invite"];
const API_URL = process.env.API_URL ?? "http://localhost:3001";

function isExpiredOrMissing(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const [, payload] = token.split(".");
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    // Refresh a little before the real expiry so the request that triggered this never 401s.
    return !exp || exp * 1000 < Date.now() + 10_000;
  } catch {
    return true;
  }
}

/**
 * The access token is short-lived (15m, P3) with no client-side background refresh. Server
 * Components can't set cookies mid-render, so silently refreshing has to happen here — the one
 * place that both runs before the page renders and can attach Set-Cookie to the response.
 * Without this, any session idle for >15m gets bounced to /login despite holding a perfectly
 * valid refresh token — the entire point of having one.
 */
async function refreshSession(request: NextRequest): Promise<Headers | null> {
  const refreshToken = request.cookies.get("refresh_token");
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { cookie: `refresh_token=${refreshToken.value}` },
  });
  return res.ok ? res.headers : null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  if (isExpiredOrMissing(request.cookies.get("access_token")?.value)) {
    const refreshedHeaders = await refreshSession(request);
    if (!refreshedHeaders) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    for (const cookie of refreshedHeaders.getSetCookie()) response.headers.append("set-cookie", cookie);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, Next internals, and the API rewrite so it isn't gated by the cookie check.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
