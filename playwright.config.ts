import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5050'
const AUTH_STATE = '.playwright/.auth/user.json'

function uiProject(
  name: string,
  testMatch: RegExp,
  deviceUse: Record<string, unknown> = {},
) {
  return {
    name,
    testMatch,
    use: {
      storageState: AUTH_STATE,
      ...deviceUse,
    },
  }
}

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./globalSetup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 8000,
  expect: {
    timeout: 8000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{-projectName}{ext}',
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
    uiProject('smoke', /tests\/smoke\/.*\.spec\.ts/),
    uiProject('auth', /tests\/auth\/.*\.spec\.ts/),
    uiProject('dashboard', /tests\/dashboard\/.*\.spec\.ts/),
    uiProject('team', /tests\/team\/.*\.spec\.ts/),
    uiProject('settings', /tests\/settings\/.*\.spec\.ts/),
    uiProject('components', /tests\/components\/.*\.spec\.ts/),
    uiProject('wizard', /tests\/wizard\/.*\.spec\.ts/),
    uiProject('activity', /tests\/activity\/.*\.spec\.ts/),
    uiProject('advanced', /tests\/advanced\/.*\.spec\.ts/),
    uiProject('states', /tests\/states\/.*\.spec\.ts/),
    uiProject('layout', /tests\/layout\/.*\.spec\.ts/),
    uiProject('widgets', /tests\/widgets\/.*\.spec\.ts/),
    uiProject('a11y', /tests\/a11y\/.*\.spec\.ts/),
    uiProject('visual', /tests\/visual\/.*\.spec\.ts/),
    uiProject('smoke-firefox', /tests\/smoke\/.*\.spec\.ts/, devices['Desktop Firefox']),
    uiProject('smoke-webkit', /tests\/smoke\/.*\.spec\.ts/, devices['Desktop Safari']),
  ],
})
