# Activity — UI dinâmica & interações com API

**Arquivo fonte:** [`activity.spec.ts`](../../../../tests/activity/activity.spec.ts)

---

## Objetivo

Esta suite valida a **página Activity** — padrões de UI dinâmica incluindo botões de fetch via API, stubbing de rede, contadores ao vivo, simulação de pipeline CI, upload de arquivo e dados de fixture. Ela cobre:

- Fetch de usuários via API com `waitForResponse`
- Simulação de API lenta com delay via `page.route`
- Respostas stubadas de lista vazia e erro 500
- Incremento/decremento/reset de contador ao vivo
- Polling de progresso de pipeline CI com `expect.poll`
- Carregamento de conteúdo dinâmico
- Zona de drop de arquivo via `setInputFiles`
- Navegação de página e validação de fixture

Demonstra [`ActivityPage`](../../../../pages/ActivityPage.ts) e interceptação avançada de rede.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Fixtures** | [`fixtures/sample-upload.txt`](../../../../fixtures/sample-upload.txt), [`lookups/countries.json`](../../../../fixtures/lookups/countries.json) |
| **Execução** | `npm run test:activity` |

---

## Tags utilizadas

Este spec não possui tags Playwright explícitas. O timeout da suite é estendido para 15 segundos via `test.describe.configure({ timeout: 15_000 })`.

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | Login via API + navegação para `/web/activity.html` |
| **Page Object** | [`ActivityPage`](../../../../pages/ActivityPage.ts) |
| **`page.route`** | Stub, delay e fulfill de respostas de API |
| **`page.waitForResponse`** | Asserta status de GET `/api/users` |
| **`expect.poll`** | Faz polling da porcentagem do pipeline até aumentar |
| **`test.step`** | Rotula sub-ações no teste de fetch users |
| **`setInputFiles`** | Simula upload de arquivo na drop zone |
| [`readFixture`](../../../../support/helpers/fixtures.ts) | Carrega fixture JSON para assertion offline |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { ActivityPage } from '../../pages/ActivityPage'
import { visitAuthenticated } from '../../support/auth'
import { readFixture } from '../../support/helpers/fixtures'

test.describe('Activity — dynamic UI & API interactions', () => {
  test.describe.configure({ timeout: 15_000 })

  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/activity.html')
    await expect(new ActivityPage(page).pageRoot()).toBeVisible()
  })
```

- **Dado:** cada teste começa autenticado na página Activity.
- **Quando:** `visitAuthenticated` injeta sessão e navega.
- **Então:** a raiz `page-activity` fica visível.

---

### Bloco 2 — Interações com API

```typescript
  test.describe('API interactions', () => {
    test('fetch users via API button returns result', async ({ page }) => {
      const activity = new ActivityPage(page)
      const usersRequest = page.waitForResponse(
        (res) => res.url().includes('/api/users') && res.request().method() === 'GET',
      )

      await test.step('Trigger fetch users', async () => {
        await activity.fetchUsers()
      })

      const response = await usersRequest
      expect(response.status()).toBe(200)
      await activity.shouldShowApiResult()
    })
```

- **Dado:** a página Activity com botão "Fetch users".
- **Quando:** o botão é clicado.
- **Então:** GET `/api/users` retorna 200 e a área de resultado é preenchida.

**Stub de API lenta:**

```typescript
    test('handles slow API with delayed response', async ({ page }) => {
      await page.route(/\/api\/users/, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1200))
        await route.continue()
      })

      const activity = new ActivityPage(page)
      await activity.fetchSlowBtn().click()
      await activity.shouldShowApiResult()
    })
```

- **Dado:** um route handler adiciona delay de 1,2s em `/api/users`.
- **Quando:** o botão de fetch lento é clicado.
- **Então:** a UI ainda exibe resultado após o delay.

**Stub de lista vazia:**

```typescript
    test('stubbed empty users list shows zero count message', async ({ page }) => {
      await page.route(/\/api\/users/, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ users: [], total: 0 }),
        }),
      )

      const activity = new ActivityPage(page)
      await activity.fetchUsers()
      await expect(activity.apiResult()).toContainText('Fetched 0 users')
    })
```

- **Dado:** a API está stubada para retornar array vazio de usuários.
- **Quando:** o fetch é disparado.
- **Então:** o resultado exibe "Fetched 0 users".

---

### Bloco 3 — Contador ao vivo

```typescript
  test.describe('Live counter', () => {
    test('increments and decrements counter value', async ({ page }) => {
      const activity = new ActivityPage(page)
      await activity.incrementCounter(2)
      await activity.shouldShowCounter(2)
      await activity.counterDecrement().click()
      await activity.shouldShowCounter(1)
    })
  })
```

- **Dado:** contador inicia em 0.
- **Quando:** increment é clicado duas vezes e decrement uma vez.
- **Então:** contador exibe 1 com badge de sessão visível.

---

### Bloco 4 — Simulação de pipeline CI

```typescript
  test.describe('CI pipeline simulation', () => {
    test('pipeline percentage increases over time', async ({ page }) => {
      const activity = new ActivityPage(page)
      await activity.startPipeline()
      const initial = parseInt((await activity.pipelinePct().innerText()).replace('%', ''), 10)
      await expect.poll(async () => {
        const pct = parseInt((await activity.pipelinePct().innerText()).replace('%', ''), 10)
        return pct
      }, { timeout: 5000 }).toBeGreaterThan(initial)
    })
  })
```

- **Dado:** pipeline está idle.
- **Quando:** Start é clicado.
- **Então:** badge muda de Idle e a porcentagem aumenta ao longo do tempo via polling.

---

### Bloco 5 — Drop zone de arquivo & fixtures

```typescript
  test.describe('File drop zone', () => {
    test('drop zone accepts file via setInputFiles', async ({ page }) => {
      const activity = new ActivityPage(page)
      const fileInput = page.locator('[data-testid="drop-zone"] input[type="file"]')
      if (await fileInput.count()) {
        await fileInput.setInputFiles('fixtures/sample-upload.txt')
      }
      await expect(activity.pageRoot()).toBeVisible()
    })
  })
```

- **Dado:** um input de arquivo dentro da drop zone.
- **Quando:** `setInputFiles` anexa um arquivo de exemplo.
- **Então:** a página permanece estável (sem crash).

```typescript
  test.describe('Fixture data', () => {
    test('countries lookup fixture exposes expected codes', async () => {
      const data = readFixture<{ countries: Array<{ code: string; name: string }> }>(
        'lookups/countries.json',
      )
      expect(data.countries.map((c) => c.code)).toEqual(expect.arrayContaining(['CA', 'US', 'BR']))
    })
  })
```

- **Dado:** uma fixture JSON em disco.
- **Quando:** `readFixture` carrega sem browser.
- **Então:** códigos de país esperados estão presentes.

---

## Como executar

```bash
npm run test:activity
npx playwright test tests/activity/activity.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/ActivityPage.ts`](../../../../pages/ActivityPage.ts)
- Suite API rules (mutação de resposta): [`tests/api/rules.api.spec.ts`](../../../../tests/api/rules.api.spec.ts)
