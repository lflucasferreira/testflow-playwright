# Smoke — Navegação e saúde da API

**Arquivo fonte:** [`navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)

---

## Objetivo

Esta suite **smoke** verifica se a aplicação TestFlow está operacional após autenticação. Ela cobre quatro dimensões complementares:

1. **Carregamento de páginas** — cada rota autenticada abre sem erro e expõe o elemento raiz esperado.
2. **Navegação pela sidebar** — links e estado ativo se comportam conforme o contrato da UI.
3. **Logout** — a sessão é limpa e o usuário é redirecionado ao login.
4. **Saúde da API** — endpoints críticos respondem com status e payload corretos.

A suite foi projetada para ser **rápida**: usa login via API (`getAuthToken` / `loginViaApi`) para evitar repetir auth na UI em cada teste e verifica apenas a raiz de cada página, sem fluxos profundos.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Aplicação rodando em `http://localhost:5050` (ou o `BASE_URL` configurado em `playwright.config.ts`) |
| **Dependências** | `npm install` executado na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` definidos em variáveis de ambiente ou `.env` |
| **Execução** | `npm run test:smoke` ou `npx playwright test tests/smoke/navigation.spec.ts` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@smoke` | Blocos de navegação, sidebar, logout e saúde da API | Sanity checks rápidos pós-deploy |
| `@api` | Bloco "Smoke — API health" | Testes HTTP via fixture `request`, sem UI do browser |

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`getAuthToken`](../../../../support/auth.ts) | Obtém Bearer token uma vez em `beforeAll` para testes de carregamento |
| [`visitWithToken`](../../../../support/auth.ts) | Injeta token no `sessionStorage` e navega para um path |
| [`loginViaApi`](../../../../support/auth.ts) | Login completo via API + visita ao dashboard para testes da sidebar |
| [`page.getByTestId`](../../../../docs/selector-strategy.md) | Seletores estáveis via `data-testid` |
| [Fixture `request`](https://playwright.dev/docs/api-testing) | Chamadas HTTP diretas sem abrir página |
| `{ tag: '@smoke' }` | Tags nativas do Playwright para filtro via grep |
| `page.evaluate()` | Lê `sessionStorage` após logout |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Imports e lista de páginas

```typescript
import { test, expect } from '@playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'
import { getAuthToken, loginViaApi, visitWithToken } from '../../support/auth'

const PAGES = [
  { path: '/web/dashboard.html', testId: 'page-dashboard', title: 'Dashboard' },
  // ... remaining pages
]
```

- **Dado:** o projeto importa helpers de auth e credenciais demo.
- **Quando:** `PAGES` define o contrato de cada rota — path, `testId` raiz e `<title>` esperado.
- **Então:** adicionar uma nova página exige apenas uma entrada no array, sem duplicar lógica.

**Páginas cobertas:** Dashboard, Team, Settings, Classic Widgets, Components, Activity, Advanced, Wizard, UI States.

---

### Bloco 2 — Smoke: navegação de páginas

```typescript
test.describe('Smoke — page navigation', { tag: '@smoke' }, () => {
  let authToken: string

  test.beforeAll(async ({ request }) => {
    authToken = await getAuthToken(request)
  })

  for (const { path, testId, title } of PAGES) {
    test(`${title} page loads without error`, async ({ page }) => {
      await visitWithToken(page, path, authToken)
      await expect(page.getByTestId(testId)).toBeVisible()
      await expect(page).toHaveTitle(new RegExp(title))
    })
  }
})
```

- **Dado:** um token de auth válido é obtido uma vez via API em `beforeAll`.
- **Quando:** cada teste visita um path com sessão pré-injetada.
- **Então:** a raiz da página fica visível e o título do browser confere — prova mínima de renderização.

---

### Bloco 3 — Smoke: navegação pela sidebar

```typescript
test.describe('Smoke — sidebar navigation', { tag: '@smoke' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request)
    await expect(page.getByTestId('page-dashboard')).toBeVisible()
  })

  test('navigates from dashboard to team via sidebar', async ({ page }) => {
    await page.getByTestId('nav-team').click()
    await expect(page.getByTestId('page-team')).toBeVisible()
    await expect(page).toHaveURL(/\/web\/team\.html/)
  })
```

- **Dado:** um usuário autenticado está no dashboard com a sidebar visível.
- **Quando:** clica no link `nav-team`.
- **Então:** a URL muda para `/web/team.html` e `page-team` aparece.

**Teste de link ativo:**

```typescript
  test('highlights the active nav link', async ({ page }) => {
    await expect(page.getByTestId('nav-dashboard')).toHaveClass(/active/)
  })
```

- **Dado:** o dashboard é a rota atual.
- **Quando:** o item de menu correspondente é inspecionado.
- **Então:** ele possui a classe CSS `active` — feedback visual de navegação.

---

### Bloco 4 — Smoke: logout

```typescript
test.describe('Smoke — logout', { tag: '@smoke' }, () => {
  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/web/login.html')
    await page.getByTestId('login-email').fill(DEMO_EMAIL)
    await page.getByTestId('login-password').fill(DEMO_PASSWORD)
    await page.getByTestId('login-submit').click()
    await page.getByTestId('page-dashboard').waitFor()

    await page.getByTestId('nav-logout').click()
    await expect(page).toHaveURL(/\/web\/index\.html/)
    expect(await page.evaluate(() => sessionStorage.getItem('sandbox-auth'))).toBeNull()
  })
})
```

- **Dado:** uma sessão ativa criada via login na UI.
- **Quando:** o usuário clica em logout.
- **Então:** é redirecionado à home e `sandbox-auth` é removido do `sessionStorage`.

---

### Bloco 5 — Smoke: saúde da API

```typescript
test.describe('Smoke — API health', { tag: ['@smoke', '@api'] }, () => {
  test('GET /health returns 200', async ({ request }) => {
    const response = await request.get('/health')
    expect(response.status()).toBe(200)
  })
```

- **Dado:** o backend TestFlow está acessível.
- **Quando:** `GET /health` é executado.
- **Então:** o status HTTP é 200.

**Login via API:**

```typescript
  test('POST /api/auth/login returns token', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.token).toBeTruthy()
    expect(body.user.email).toBe(DEMO_EMAIL)
  })
```

- **Dado:** credenciais DEMO válidas.
- **Quando:** `POST /api/auth/login` com body JSON.
- **Então:** resposta é 200, token está presente e o email do usuário confere.

**Endpoints de erro:**

```typescript
  test('GET /api/errors/404 returns 404 status', async ({ request }) => {
    const response = await request.get('/api/errors/404')
    expect(response.status()).toBe(404)
  })
```

- **Dado:** rotas de erro simuladas existem no backend.
- **Quando:** requisição é feita a `/api/errors/404` ou `/api/errors/422`.
- **Então:** o status assertado confere (404 ou 422).

---

## Como executar

```bash
# Projeto smoke completo
npm run test:smoke

# Apenas este arquivo
npx playwright test tests/smoke/navigation.spec.ts

# Tag @smoke nos projetos smoke + api
npm run test:grep:smoke

# Smoke cross-browser (Firefox / WebKit)
npm run test:smoke-firefox
npm run test:smoke-webkit
```

---

## Referências relacionadas

- Helpers de auth: [`support/auth.ts`](../../../../support/auth.ts)
- Projetos no Playwright config: [`playwright.config.ts`](../../../../playwright.config.ts)
- Estratégia de seletores: [`docs/selector-strategy.md`](../../../../selector-strategy.md)
