import { defineConfig, devices } from "@playwright/test";

// When BASE_URL is set or SKIP_DEV_SERVER is set, assume a server is already running.
const externalServer = !!(process.env.BASE_URL || process.env.SKIP_DEV_SERVER || process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // keep sequential — each test resets DB state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: externalServer ? undefined : {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
