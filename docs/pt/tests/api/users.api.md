# API — Users & Health

**Arquivo fonte:** [`users.api.spec.ts`](../../../../tests/api/users.api.spec.ts)

---

## Objetivo

Este módulo cobre **testes de contrato** para listagem de usuários e endpoints de health, além de testes de **integração UI** que stubam a API de usuários na página Team. Valida:

- Contrato de resposta de `GET /api/users` (status, timing, schema, emails, roles)
- Comparação com golden fixture para roles de usuário
- Disponibilidade e performance de `GET /health`
- Endpoints de simulação de erro (404, 422) com bodies de mensagem
- Interceptação de rede na página Team (carga real, stub vazio, stub 500)
- Validação offline de fixture para lookup de países

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Backend respondendo em `/api/users` e `/health` |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` para testes de intercept UI |
| **Fixtures** | [`users/golden-roles.json`](../../../../fixtures/users/golden-roles.json), [`lookups/countries.json`](../../../../fixtures/lookups/countries.json) |
| **Execução** | `npm run test:api` |

---

## Tags utilizadas

Este spec não possui tags Playwright explícitas. Roda no projeto `api`.

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| **Fixture `request`** | Testes HTTP puros sem browser |
| **`test.beforeAll`** | GET `/api/users` único compartilhado entre testes de contrato |
| [`validateSchema`](../../../../support/helpers.ts) | Validação leve de tipos de campo |
| [`expectSameMembers`](../../../../support/helpers/contract.ts) | Comparação de arrays independente de ordem |
| [`readFixture`](../../../../support/helpers/fixtures.ts) | Carrega snapshot golden de roles |
| **`page.route` + `route.fulfill`** | Stub da API de usuários no reload da página Team |
| **`page.waitForRequest`** | Captura GET `/api/users` no reload da página |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Contrato GET /api/users

```typescript
import { test, expect, APIResponse } from '@playwright/test'
import { validateSchema } from '../../support/helpers'
import { readFixture } from '../../support/helpers/fixtures'
import { expectSameMembers } from '../../support/helpers/contract'

test.describe('API — Users & Health', () => {
  test.describe('GET /api/users', () => {
    let res: APIResponse
    let body: { users: Array<Record<string, unknown>> }
    let duration: number

    test.beforeAll(async ({ request }) => {
      const start = Date.now()
      res = await request.get('/api/users')
      duration = Date.now() - start
      body = await res.json()
    })

    test('returns status 200', async () => {
      expect(res.status()).toBe(200)
    })

    test('each user has required fields with correct types', async () => {
      for (const user of body.users) {
        validateSchema(user, { name: 'string', email: 'string', role: 'string' })
      }
    })
```

- **Dado:** um único GET `/api/users` em `beforeAll`.
- **Quando:** cada teste inspeciona um aspecto do contrato.
- **Então:** status 200, resposta rápida, array de usuários não vazio com campos tipados e emails válidos.

**Golden roles:**

```typescript
    test('user roles match golden fixture snapshot', async () => {
      const golden = readFixture<{ roles: string[] }>('users/golden-roles.json')
      const roles = [...new Set(body.users.map((u) => String(u.role)))].sort()
      expectSameMembers(golden.roles.sort(), roles)
    })
```

- **Dado:** uma golden fixture commitada com roles esperados.
- **Quando:** roles da API live são extraídos e ordenados.
- **Então:** conferem com a fixture independente da ordem.

---

### Bloco 2 — Health & endpoints de erro

```typescript
  test.describe('GET /health', () => {
    test('returns status 200', async ({ request }) => {
      const response = await request.get('/health')
      expect(response.status()).toBe(200)
    })

    test('responds within 1000ms', async ({ request }) => {
      const start = Date.now()
      await request.get('/health')
      expect(Date.now() - start).toBeLessThan(1000)
    })
  })

  test.describe('Error simulation endpoints', () => {
    test('GET /api/errors/404 returns 404', async ({ request }) => {
      const response = await request.get('/api/errors/404')
      expect(response.status()).toBe(404)
    })
  })
```

- **Dado:** rotas de health e simulação de erro.
- **Quando:** requisições GET são feitas.
- **Então:** status codes corretos e mensagens de erro não vazias.

---

### Bloco 3 — Intercept na página Team

```typescript
  test.describe('Intercept — users list loaded on Team page', () => {
    test.beforeEach(async ({ page, request }) => {
      await visitAuthenticated(page, request, '/web/team.html')
    })

    test('Team page triggers GET /api/users on load', async ({ page }) => {
      const loadUsers = page.waitForRequest(
        (req) => req.method() === 'GET' && /\/api\/users/.test(req.url()),
        { timeout: 3000 },
      ).catch(() => null)

      await page.reload()
      await expect(page.getByTestId('users-table')).toBeVisible()

      const interception = await loadUsers
      if (interception) {
        expect((await interception.response())?.status()).toBe(200)
      }
    })
```

- **Dado:** página Team autenticada.
- **Quando:** página recarrega e opcionalmente dispara fetch de API.
- **Então:** GET `/api/users` retorna 200 se a página for orientada a API.

**Stub vazio:**

```typescript
    test('stubbed empty users list shows zero rows if page uses API', async ({ page }) => {
      await page.route(/\/api\/users/, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ users: [] }),
        }),
      )

      await page.reload()
      const interception = await page.waitForRequest(/* ... */).catch(() => null)
      if (interception) {
        await expect(page.getByTestId('users-table').locator('tbody tr')).toHaveCount(0)
      }
    })
```

- **Dado:** API stubada para retornar array vazio de usuários.
- **Quando:** página Team recarrega.
- **Então:** tabela exibe zero linhas se for orientada a API.

---

## Como executar

```bash
npm run test:api
npx playwright test tests/api/users.api.spec.ts
```

---

## Referências relacionadas

- Suite UI Team: [`tests/team/team.spec.ts`](../../../../tests/team/team.spec.ts)
- Saúde API smoke: [`tests/smoke/navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)
- Golden roles fixture: [`fixtures/users/golden-roles.json`](../../../../fixtures/users/golden-roles.json)
