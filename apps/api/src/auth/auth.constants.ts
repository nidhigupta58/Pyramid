export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const ACCESS_TOKEN_TTL = '15m';
export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;

export const REFRESH_TOKEN_TTL = '7d';
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Path=/ (not scoped to /auth) — the web app's proxy (apps/web/src/proxy.ts) needs this cookie
// on ordinary page navigations to silently refresh an expired access token before the page
// renders, since Server Components can't set cookies mid-request. httpOnly already keeps it
// out of reach of client JS regardless of path.
export const REFRESH_TOKEN_COOKIE_PATH = '/';

export const isGoogleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL);
