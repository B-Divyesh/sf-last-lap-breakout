import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run build && npm run preview:test',
    url: 'http://127.0.0.1:4173',
    timeout: 30_000,
    // The test command owns this one strict-port production preview for the
    // entire browser suite. Do not attach to a stale manually-held server.
    reuseExistingServer: false
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }]
});
