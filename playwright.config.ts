import { defineConfig } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5050'

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./globalSetup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 8000,
  expect: { timeout: 8000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 8000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'api', testMatch: /tests\/api\/.*\.spec\.ts/ },
    { name: 'smoke', testMatch: /tests\/smoke\/.*\.spec\.ts/ },
    { name: 'auth', testMatch: /tests\/auth\/.*\.spec\.ts/ },
    { name: 'dashboard', testMatch: /tests\/dashboard\/.*\.spec\.ts/ },
    { name: 'team', testMatch: /tests\/team\/.*\.spec\.ts/ },
    { name: 'settings', testMatch: /tests\/settings\/.*\.spec\.ts/ },
    { name: 'components', testMatch: /tests\/components\/.*\.spec\.ts/ },
    { name: 'wizard', testMatch: /tests\/wizard\/.*\.spec\.ts/ },
    { name: 'activity', testMatch: /tests\/activity\/.*\.spec\.ts/ },
    { name: 'advanced', testMatch: /tests\/advanced\/.*\.spec\.ts/ },
    { name: 'states', testMatch: /tests\/states\/.*\.spec\.ts/ },
    { name: 'layout', testMatch: /tests\/layout\/.*\.spec\.ts/ },
    { name: 'widgets', testMatch: /tests\/widgets\/.*\.spec\.ts/ },
    { name: 'a11y', testMatch: /tests\/a11y\/.*\.spec\.ts/ },
  ],
})
