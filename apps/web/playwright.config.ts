import { defineConfig, devices } from "@playwright/test";

// §10 of the implementation plan: every state at 1280x800, DPR 2, against a seeded DB so
// content is identical run to run.
export default defineConfig({
  testDir: "./qa/tests",
  globalSetup: require.resolve("./qa/global-setup.ts"),
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:3000",
    storageState: "./qa/.auth/user.json",
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  },
  webServer: [
    {
      command: "pnpm --filter api start:dev",
      url: "http://localhost:3001/api/v1",
      reuseExistingServer: true,
      cwd: "../..",
      timeout: 60_000,
    },
    {
      command: "pnpm --filter web dev",
      url: "http://localhost:3000/login",
      reuseExistingServer: true,
      cwd: "../..",
      timeout: 60_000,
    },
  ],
});
