import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Loads .env.local for the test-runner process itself. The webServer child
// process (Next.js) already reads .env.local on its own — this covers the
// separate Node process that runs the test files, which needs
// SUPABASE_SERVICE_ROLE_KEY etc. for the cleanup helpers in smoke.spec.ts.
// In CI, these are set directly as job env vars instead of a .env file.
if (!process.env.CI) {
  dotenv.config({ path: ".env.local" });
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // sequential — tests share rate-limit quota against the same backend
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // Combined (no NEXT_PUBLIC_TRACK) build — both /nato/* and /air-force/*
    // are reachable directly regardless of deployment mode, so one server
    // covers both tracks without needing two separate builds.
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
