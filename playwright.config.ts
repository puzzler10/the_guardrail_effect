import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60000,
  workers: 1, // WebGL pages are heavy; parallel runs cause flaky timeouts
  use: {
    baseURL: 'http://localhost:5178',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5178,
    reuseExistingServer: true,
    timeout: 10000,
  },
})
