# API — Rules Engine & JSON Patch

**Source file:** [`rules.api.spec.ts`](../../../../tests/api/rules.api.spec.ts)

---

## Purpose

This module covers **advanced API patterns** including RFC 6902 JSON Patch, data-driven patch tests, read-after-write verification, and response mutation via `page.route`. It validates:

- `JsonPatchBuilder` utility for patch operation construction
- `UserPatchFactory` for test payload generation
- PATCH via rules client with HTTP exchange reporting
- Data-driven valid/invalid patch scenarios from fixture
- Mandatory field negative tests
- Read-after-write with polling
- Service credentials helpers
- UI intercept with mutated API response on Activity page

It uses custom fixtures from [`fixtures.ts`](../../../../fixtures.ts) that provide an `authToken` fixture.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Backend supporting PATCH `/api/users/:id` (or tolerant status codes) |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` |
| **Fixtures** | [`api/patch-payloads.json`](../../../../fixtures/api/patch-payloads.json) |
| **Execution** | `npm run test:api` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@api` | Top-level describe, data-driven tests | API contract suite |
| `@regression` | Top-level `test.describe` | Included in full regression grep |

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| **Custom fixtures** | [`fixtures.ts`](../../../../fixtures.ts) — extends base test with `authToken` |
| **`JsonPatchBuilder`](../../../../support/utilities/jsonPatch.ts) | Fluent RFC 6902 patch builder |
| **`UserPatchFactory`](../../../../support/factories/userPatch.ts) | Generates name patch payloads |
| [`patchUserViaRules`](../../../../support/api/rulesClient.ts) | Authenticated PATCH client |
| [`runPatchTests`](../../../../support/utilities/patchTests.ts) | Data-driven patch test generator |
| [`attachHttpExchangeReport`](../../../../support/helpers/apiExchange.ts) | Attaches request/response to HTML report |
| **`page.route` + `route.fetch()`** | Mutates live response before fulfilling |

---

## Step-by-step — block by block

### Block 1 — JSON Patch utilities

```typescript
import { test, expect } from '../../fixtures'
import { JsonPatchBuilder, modifyPatchField } from '../../support/utilities/jsonPatch'
import { UserPatchFactory } from '../../support/factories/userPatch'

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
```

- **Given:** patch builder and factory utilities.
- **When:** patches are built or modified.
- **Then:** RFC 6902 operations have correct `op`, `path`, and `value`.

---

### Block 2 — PATCH via rules client

```typescript
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
  })
```

- **Given:** authenticated request with Bearer token from fixture.
- **When:** PATCH is sent with `application/json-patch+json`.
- **Then:** response status is one of the allowed HTTP codes; exchange is attached to the report.

---

### Block 3 — Data-driven patch tests

```typescript
const patchPayloads = readFixture<PatchPayloadFixture>('api/patch-payloads.json')

  runPatchTests(
    'Data-driven — valid name payloads',
    patchPayloads.validNamePatches.map((item) => ({
      label: item.label,
      patches: item.patches,
      userId: item.userId,
    })),
    { tag: '@api' },
  )

  runPatchTests(
    'Data-driven — invalid payloads',
    patchPayloads.invalidPatches.map((item) => ({
      label: item.label,
      patches: item.patches,
      userId: item.userId,
      allowedStatuses: [EXPECT.badRequest, EXPECT.notFound, EXPECT.validationError, EXPECT.serverError],
    })),
    { tag: '@api' },
  )
```

- **Given:** patch payloads loaded from JSON fixture.
- **When:** `runPatchTests` generates one test per payload entry.
- **Then:** valid patches expect success-range statuses; invalid patches expect 4xx/5xx.

---

### Block 4 — Read-after-write

```typescript
  test.describe('Read-after-write', () => {
    test('GET /api/users after auth returns valid user list', async ({ request, authToken }, testInfo) => {
      const response = await getUsersViaProfile(request, authToken)
      expect(response.status()).toBe(EXPECT.happy)
      const body = await response.json()
      validateSchema(body.users[0], { name: 'string', email: 'string', role: 'string' })
    })

    test('PATCH flow with poll when write API succeeds', async ({ request, authToken }) => {
      const uniqueName = `PatchFlow ${Date.now()}`
      const patches = UserPatchFactory.createSimpleNamePatch(uniqueName)
      await executeSuccessfulPatchFlow(request, authToken, 1, patches, 'name')
    })
  })
```

- **Given:** authenticated API client.
- **When:** GET users or PATCH + poll is executed.
- **Then:** list schema is valid; patch change is eventually readable.

---

### Block 5 — Intercept with response mutation

```typescript
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
```

- **Given:** Activity page with live API route handler.
- **When:** `route.fetch()` gets the real response, then mutates `users` to `[]`.
- **Then:** UI displays "Fetched 0 users" without changing the backend.

---

## How to run

```bash
npm run test:api
npx playwright test tests/api/rules.api.spec.ts
npm run test:grep:regression -- tests/api/rules.api.spec.ts
```

---

## Related references

- Custom fixtures: [`fixtures.ts`](../../../../fixtures.ts)
- Patch payloads: [`fixtures/api/patch-payloads.json`](../../../../fixtures/api/patch-payloads.json)
- Activity API stubs: [`tests/activity/activity.spec.ts`](../../../../tests/activity/activity.spec.ts)
