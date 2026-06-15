import { test, expect } from '../../fixtures'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'

test.describe('CI — environment diagnostics', { tag: '@api' }, () => {
  test('demo credentials env vars are configured', async () => {
    await test.step('Validate demo credentials', async () => {
      expect(DEMO_EMAIL, 'DEMO_EMAIL').toBeTruthy()
      expect(DEMO_PASSWORD, 'DEMO_PASSWORD').toBeTruthy()
    })
  })

  test('BASE_URL resolves to TestFlow default or override', async () => {
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:5050'
    expect(baseUrl).toMatch(/^https?:\/\//)
  })

  test('TestFlow health endpoint is reachable', async ({ request }) => {
    await test.step('GET /health', async () => {
      const response = await request.get('/health')
      expect(response.status()).toBe(200)
    })
  })
})
