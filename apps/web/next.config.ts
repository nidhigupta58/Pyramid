import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // Same-origin cookies (plan §12): the browser only ever sees one origin, so the httpOnly
  // JWT cookie set by the API is first-party here — no CORS preflight, no cross-site gymnastics.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
