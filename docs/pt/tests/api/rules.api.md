# API — Rules Engine & JSON Patch

**Arquivo fonte:** [`rules.api.spec.ts`](../../../../tests/api/rules.api.spec.ts)

---

## Objetivo

Este módulo cobre **padrões avançados de API** incluindo JSON Patch RFC 6902, testes data-driven de patch, verificação read-after-write e mutação de resposta via `page.route`. Valida:

- Utilitário `JsonPatchBuilder` para construção de operações de patch
- `UserPatchFactory` para geração de payloads de teste
- PATCH via rules client com report de HTTP exchange
- Cenários data-driven de patch válido/inválido a partir de fixture
- Testes negativos de campos obrigatórios
- Read-after-write com polling
- Helpers de credenciais de serviço
- Intercept UI com resposta de API mutada na página Activity

Usa fixtures customizadas de [`fixtures.ts`](../../../../fixtures.ts) que fornecem a fixture `authToken`.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Backend suportando PATCH `/api/users/:id` (ou status codes tolerantes) |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` |
| **Fixtures** | [`api/patch-payloads.json`](../../../../fixtures/api/patch-payloads.json) |
| **Execução** | `npm run test:api` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@api` | Describe de nível superior, testes data-driven | Suite de contrato API |
| `@regression` | `test.describe` de nível superior | Incluído no grep de regressão completa |

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| **Fixtures customizadas** | [`fixtures.ts`](../../../../fixtures.ts) — estende test base com `authToken` |
| **`JsonPatchBuilder`](../../../../support/utilities/jsonPatch.ts) | Builder fluente de patch RFC 6902 |
| **`UserPatchFactory`](../../../../support/factories/userPatch.ts) | Gera payloads de patch de nome |
| [`patchUserViaRules`](../../../../support/api/rulesClient.ts) | Cliente PATCH autenticado |
| [`runPatchTests`](../../../../support/utilities/patchTests.ts) | Gerador de testes data-driven de patch |
| [`attachHttpExchangeReport`](../../../../support/helpers/apiExchange.ts) | Anexa request/response ao relatório HTML |
| **`page.route` + `route.fetch()`** | Muta resposta live antes do fulfill |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Utilitários JSON Patch

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

- **Dado:** utilitários de builder e factory de patch.
- **Quando:** patches são construídos ou modificados.
- **Então:** operações RFC 6902 têm `op`, `path` e `value` corretos.

---

### Bloco 2 — PATCH via rules client

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

- **Dado:** requisição autenticada com Bearer token da fixture.
- **Quando:** PATCH é enviado com `application/json-patch+json`.
- **Então:** status da resposta é um dos códigos HTTP permitidos; exchange é anexado ao relatório.

---

### Bloco 3 — Testes data-driven de patch

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

- **Dado:** payloads de patch carregados de fixture JSON.
- **Quando:** `runPatchTests` gera um teste por entrada de payload.
- **Então:** patches válidos esperam status de sucesso; inválidos esperam 4xx/5xx.

---

### Bloco 4 — Read-after-write

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

- **Dado:** cliente API autenticado.
- **Quando:** GET users ou PATCH + poll é executado.
- **Então:** schema da lista é válido; alteração do patch fica eventualmente legível.

---

### Bloco 5 — Intercept com mutação de resposta

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

- **Dado:** página Activity com route handler de API live.
- **Quando:** `route.fetch()` obtém a resposta real e muta `users` para `[]`.
- **Então:** UI exibe "Fetched 0 users" sem alterar o backend.

---

## Como executar

```bash
npm run test:api
npx playwright test tests/api/rules.api.spec.ts
npm run test:grep:regression -- tests/api/rules.api.spec.ts
```

---

## Referências relacionadas

- Fixtures customizadas: [`fixtures.ts`](../../../../fixtures.ts)
- Patch payloads: [`fixtures/api/patch-payloads.json`](../../../../fixtures/api/patch-payloads.json)
- Stubs de API Activity: [`tests/activity/activity.spec.ts`](../../../../tests/activity/activity.spec.ts)
