import { test as base, expect } from '@playwright/test'
import { getAuthToken } from './support/auth'
import { attachHttpExchangeReport } from './support/helpers/apiExchange'

export const test = base.extend<{ authToken: string }>({
  authToken: async ({ request }, use) => {
    await use(await getAuthToken(request))
  },
})

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await testInfo.attach('failure-status', {
      body: `Expected: ${testInfo.expectedStatus}\nActual: ${testInfo.status}`,
      contentType: 'text/plain',
    })
  }
})

export { expect, attachHttpExchangeReport }
