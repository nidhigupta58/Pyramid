import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import jwt from "jsonwebtoken";
import { Client } from "pg";
import type { FullConfig } from "@playwright/test";

const API_ENV_PATH = path.resolve(__dirname, "../../api/.env");
const AUTH_DIR = path.resolve(__dirname, ".auth");
const AUTH_FILE = path.join(AUTH_DIR, "user.json");
const AUTH_FILE_DARK = path.join(AUTH_DIR, "user-dark.json");

// The seeded demo user (apps/api/prisma/seed.ts) owns the one fixed-content workspace all QA
// screenshots render against — auth as a real "Continue as Guest" session would create a fresh
// random workspace every run, which breaks pixel-stable regression baselines.
export default async function globalSetup(config: FullConfig) {
  loadEnv({ path: API_ENV_PATH });

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query<{ id: string }>("select id from users where email = $1", [
    "guest@pyramid.local",
  ]);
  await client.end();

  const userId = rows[0]?.id;
  if (!userId) throw new Error("Seed user not found — run `pnpm db:seed` before the QA suite.");

  const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: "2h" });
  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:3000";
  const domain = new URL(baseURL).hostname;

  const accessCookie = {
    name: "access_token",
    value: accessToken,
    domain,
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "Lax" as const,
  };

  if (!existsSync(AUTH_DIR)) await mkdir(AUTH_DIR, { recursive: true });
  await writeFile(AUTH_FILE, JSON.stringify({ cookies: [accessCookie], origins: [] }));
  await writeFile(
    AUTH_FILE_DARK,
    JSON.stringify({
      cookies: [
        accessCookie,
        { name: "theme", value: "dark", domain, path: "/", httpOnly: false, secure: false, sameSite: "Lax" },
      ],
      origins: [],
    }),
  );
}
