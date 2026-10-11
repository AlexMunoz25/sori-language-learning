import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 20000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: 'chrome',
  },
  projects: [
    { name: 'iphone-se', use: { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true } },
    { name: 'iphone-13', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'iphone-plus', use: { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
  ],
  webServer: { command: 'npm run dev -- --port 5173', url: 'http://localhost:5173', reuseExistingServer: true },
})
