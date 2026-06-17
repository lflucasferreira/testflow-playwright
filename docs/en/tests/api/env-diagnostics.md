# CI — Environment Diagnostics

**Source file:** [`env-diagnostics.spec.ts`](../../../../tests/api/env-diagnostics.spec.ts)

---

## Purpose

This lightweight suite validates **CI/CD prerequisites** before the full test suite runs. It checks:

1. Demo credential environment variables are configured
2. `BASE_URL` resolves to a valid HTTP(S) URL
3. TestFlow health endpoint is reachable

It fails fast in pipelines when the environment is misconfigured, saving time on downstream test failures.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Ideally running at `http://localhost:5050` (or configured `BASE_URL`) |
| **Environment** | `DEMO_EMAIL`, `DEMO_PASSWORD`, optional `BASE_URL` |
| **Execution** | `npm run test:api` (included in the `api` project) |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@api` | Top-level `test.describe` | Runs with API project; grep-friendly |

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| **Custom fixtures** | Imports `test` from [`fixtures.ts`](../../../../fixtures.ts) |
| **`test.step`** | Labels sub-actions in diagnostic tests |
| **`process.env.BASE_URL`** | Reads optional URL override |
| [`DEMO_EMAIL`, `DEMO_PASSWORD`](../../../../support/helpers.ts) | Resolved from environment |
| **`request` fixture** | Verifies `/health` without browser |

---

## Step-by-step — block by block

### Block 1 — Demo credentials

```typescript
import { test, expect } from '../../fixtures'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'

test.describe('CI — environment diagnostics', { tag: '@api' }, () => {
  test('demo credentials env vars are configured', async () => {
    await test.step('Validate demo credentials', async () => {
      expect(DEMO_EMAIL, 'DEMO_EMAIL').toBeTruthy()
      expect(DEMO_PASSWORD, 'DEMO_PASSWORD').toBeTruthy()
    })
  })
```

- **Given:** the CI runner or local shell has environment variables set.
- **When:** `DEMO_EMAIL` and `DEMO_PASSWORD` are read from helpers.
- **Then:** both are non-empty strings (custom expect message aids debugging).

---

### Block 2 — BASE_URL validation

```typescript
  test('BASE_URL resolves to TestFlow default or override', async () => {
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:5050'
    expect(baseUrl).toMatch(/^https?:\/\//)
  })
```

- **Given:** optional `BASE_URL` env var or default localhost.
- **When:** the URL string is inspected.
- **Then:** it starts with `http://` or `https://` — catches typos like missing scheme.

---

### Block 3 — Health endpoint

```typescript
  test('TestFlow health endpoint is reachable', async ({ request }) => {
    await test.step('GET /health', async () => {
      const response = await request.get('/health')
      expect(response.status()).toBe(200)
    })
  })
})
```

- **Given:** `baseURL` from Playwright config points to TestFlow.
- **When:** `GET /health` is executed via the `request` fixture.
- **Then:** status is 200 — confirms the app is up before heavier suites run.

---

## How to run

```bash
# Runs with all API specs
npm run test:api

# This file only
npx playwright test tests/api/env-diagnostics.spec.ts

# With explicit BASE_URL
BASE_URL=http://localhost:5050 npx playwright test tests/api/env-diagnostics.spec.ts
```

---

## Related references

- Playwright config: [`playwright.config.ts`](../../../../playwright.config.ts)
- Global setup (auth cache): [`globalSetup.ts`](../../../../globalSetup.ts)
- Smoke health check: [`tests/smoke/navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)
