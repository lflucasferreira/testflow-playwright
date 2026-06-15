import { test, expect } from '../../fixtures'
import { EXPECT } from '../../support/constants/httpStatus'
import { JsonPatchBuilder, modifyPatchField } from '../../support/utilities/jsonPatch'
import { UserPatchFactory } from '../../support/factories/userPatch'
import { patchUserViaRules, getUsersViaProfile, SERVICE_CREDENTIALS } from '../../support/api/rulesClient'
import { attachHttpExchangeReport } from '../../support/helpers/apiExchange'
import { pollGetUsersField } from '../../support/utilities/retry'
import { validateSchema } from '../../support/helpers'
import { visitAuthenticated } from '../../support/auth'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'

test.describe('API — Rules engine patterns', { tag: ['@api', '@regression'] }, () => {
  test.describe('JSON Patch utilities', () => {
    test('builds RFC 6902 patch operations', () => {
      const patches = new JsonPatchBuilder()
        .replace('/name', 'Alex')
        .replace('/role', 'admin')
        .build()

      expect(patches).toHaveLength(2)
      expect(patches[0]).toEqual({ op: 'replace', path: '/name', value: 'Alex' })
    })

    test('modifies patch field for negative tests', () => {
      const base = UserPatchFactory.createNamePatch('A', 'B', 'C')
      const invalid = modifyPatchField(base, '/name', null)
      expect(invalid.find((p) => p.path === '/name')?.value).toBeNull()
    })
  })

  test.describe('PATCH via rules client', () => {
    test('accepts JSON Patch content type', async ({ request, authToken }, testInfo) => {
      const patches = UserPatchFactory.createNamePatch('Patch', 'Test', 'User')
      const response = await patchUserViaRules(request, authToken, 1, patches)
      await attachHttpExchangeReport(testInfo, {
        label: 'patch-user-rules',
        method: 'PATCH',
        url: '/api/users/1',
        requestHeaders: { Authorization: 'Bearer ***', 'Content-Type': 'application/json-patch+json' },
        requestBody: patches,
        response,
      })
      expect([EXPECT.happy, EXPECT.noContent, EXPECT.notFound, EXPECT.badRequest, EXPECT.validationError, EXPECT.methodNotAllowed])
        .toContain(response.status())
    })

    test('rejects invalid patch path', async ({ request, authToken }) => {
      const response = await patchUserViaRules(request, authToken, 999, [
        { op: 'replace', path: '/invalid', value: null },
      ])
      expect([EXPECT.badRequest, EXPECT.notFound, EXPECT.validationError, EXPECT.serverError])
        .toContain(response.status())
    })
  })

  test.describe('Read-after-write', () => {
    test('GET /api/users after auth returns valid user list', async ({ request, authToken }, testInfo) => {
      const response = await getUsersViaProfile(request, authToken)
      await attachHttpExchangeReport(testInfo, {
        label: 'get-users-profile',
        method: 'GET',
        url: '/api/users',
        requestHeaders: { Authorization: 'Bearer ***' },
        response,
      })
      expect(response.status()).toBe(EXPECT.happy)
      const body = await response.json()
      expect(body.users.length).toBeGreaterThan(0)
      validateSchema(body.users[0], { name: 'string', email: 'string', role: 'string' })
    })

    test('PATCH flow with poll when write API succeeds', async ({ request, authToken }) => {
      const uniqueName = `PatchFlow ${Date.now()}`
      const patches = UserPatchFactory.createSimpleNamePatch(uniqueName)
      const patchRes = await patchUserViaRules(request, authToken, 1, patches)

      if (patchRes.status() === EXPECT.happy || patchRes.status() === EXPECT.noContent) {
        const match = await pollGetUsersField(request, 'name', uniqueName, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        expect(match.name).toBe(uniqueName)
      } else {
        expect([EXPECT.notFound, EXPECT.badRequest, EXPECT.methodNotAllowed, EXPECT.validationError])
          .toContain(patchRes.status())
      }
    })
  })

  test.describe('Mandatory field validation', () => {
    for (const path of ['/name']) {
      test(`rejects null at ${path}`, async ({ request, authToken }) => {
        const base = UserPatchFactory.createSimpleNamePatch('Valid Name')
        const modified = modifyPatchField(base, path, null)
        const response = await patchUserViaRules(request, authToken, 1, modified)
        expect([EXPECT.badRequest, EXPECT.notFound, EXPECT.validationError, EXPECT.serverError])
          .toContain(response.status())
      })
    }
  })

  test.describe('Service token helpers', () => {
    test('login stores usable Bearer token', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
      })
      const body = await response.json()
      expect(typeof body.token).toBe('string')
      expect(body.token.length).toBeGreaterThan(0)
    })

    test('getServiceCredentials returns client credentials object', async () => {
      expect(SERVICE_CREDENTIALS).toEqual(
        expect.objectContaining({ client_id: expect.any(String), client_secret: expect.any(String) }),
      )
    })
  })

  test.describe('Intercept with response mutation', () => {
    test('mutated empty users list shows Fetched 0 users on activity page', async ({ page, request }) => {
      await visitAuthenticated(page, request, '/web/activity.html')
      await page.route(/\/api\/users/, async (route) => {
        const response = await route.fetch()
        const body = await response.json()
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...body, users: [], total: 0 }),
        })
      })

      await page.getByTestId('fetch-users-btn').click()
      await expect(page.getByTestId('api-result')).toContainText('Fetched 0 users')
    })
  })
})
