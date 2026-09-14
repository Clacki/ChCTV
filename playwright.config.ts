import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL, ...devices["Desktop Chrome"] },
  webServer: {
    command: `corepack pnpm dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
