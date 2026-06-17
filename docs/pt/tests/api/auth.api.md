# API — Autenticação (POST /api/auth/login)

**Arquivo fonte:** [`auth.api.spec.ts`](../../../../tests/api/auth.api.spec.ts)

---

## Objetivo

Este módulo cobre **testes de contrato e integração** do endpoint de login. Valida:

- Contrato de resposta de sucesso (status, content-type, timing, token, user)
- Usabilidade do token em requisições autenticadas subsequentes
- Respostas 401 para credenciais inválidas
- Respostas 4xx para payloads malformados
- Integração UI + rede com toggle de API e erro 500 stubado

Combina testes de API puros via fixture `request` com testes de interceptação baseados em browser.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Backend respondendo em `POST /api/auth/login` |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Execução** | `npm run test:api` (executa todos os specs de API) |

---

## Tags utilizadas

Este spec não possui tags Playwright explícitas. Roda no projeto `api`.

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| **Fixture `request`** | Cliente HTTP sem browser |
| **`test.beforeAll`** | Requisição de login única compartilhada entre testes de credenciais válidas |
| **`APIResponse`** | Resposta tipada armazenada em variáveis de escopo do describe |
| **`page.waitForRequest`** | Captura POST de login do fluxo UI |
| **`page.route` + `route.fulfill`** | Stub de erro 500 no endpoint de login |
| **Page Object** | [`LoginPage`](../../../../pages/LoginPage.ts) para bloco de intercept |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Constantes e setup de credenciais válidas

```typescript
import { test, expect, APIResponse } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'

const ENDPOINT = '/api/auth/login'
const VALID = { email: DEMO_EMAIL, password: DEMO_PASSWORD }

test.describe('API — POST /api/auth/login', () => {
  test.describe('Valid credentials', () => {
    let res: APIResponse
    let body: Record<string, unknown>
    let duration: number

    test.beforeAll(async ({ request }) => {
      const start = Date.now()
      res = await request.post(ENDPOINT, { data: VALID })
      duration = Date.now() - start
      body = await res.json()
    })
```

- **Dado:** credenciais DEMO válidas.
- **Quando:** um único POST roda em `beforeAll`.
- **Então:** resposta, body e duration são compartilhados entre múltiplas assertions — reduz carga no servidor.

---

### Bloco 2 — Assertions de credenciais válidas

```typescript
    test('returns status 200', async () => {
      expect(res.status()).toBe(200)
    })

    test('responds within 2000ms', async () => {
      expect(duration).toBeLessThan(2000)
    })

    test('body has token as non-empty string', async () => {
      expect(typeof body.token).toBe('string')
      expect((body.token as string).length).toBeGreaterThan(0)
    })

    test('token can authenticate a subsequent request', async ({ request }) => {
      const response = await request.get('/api/users', {
        headers: { Authorization: `Bearer ${body.token}` },
      })
      expect(response.status()).toBe(200)
    })
```

- **Dado:** a resposta de login compartilhada.
- **Quando:** cada teste inspeciona um aspecto diferente do contrato.
- **Então:** status 200, content-type JSON, resposta rápida, token válido e auth Bearer em `/api/users` passam.

---

### Bloco 3 — Credenciais inválidas

```typescript
  test.describe('Invalid credentials', () => {
    test('returns 401 for wrong password', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { email: VALID.email, password: 'wrongpassword' },
      })
      expect(response.status()).toBe(401)
    })

    test('error response has a non-empty error or message field', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { email: VALID.email, password: 'wrong' },
      })
      const body = await response.json()
      const errText = (body.message as string) ?? (body.error as { message?: string })?.message
      expect(typeof errText).toBe('string')
      expect(errText.length).toBeGreaterThan(0)
    })
  })
```

- **Dado:** senha inválida ou email desconhecido.
- **Quando:** POST é enviado com credenciais ruins.
- **Então:** status é 401 e body de erro contém mensagem.

---

### Bloco 4 — Requisição malformada

```typescript
  test.describe('Malformed request', () => {
    test('returns 4xx when body is empty', async ({ request }) => {
      const response = await request.post(ENDPOINT, { data: {} })
      expect(response.status()).toBeGreaterThanOrEqual(400)
      expect(response.status()).toBeLessThanOrEqual(422)
    })
  })
```

- **Dado:** payloads de login incompletos (body vazio, email ausente, senha ausente).
- **Quando:** POST é enviado.
- **Então:** status está na faixa 400–422.

---

### Bloco 5 — Intercept — fluxo de login

```typescript
  test.describe('Intercept — login flow validates network contract', () => {
    test('API toggle sends POST with correct payload and token response', async ({ page }) => {
      const login = new LoginPage(page)
      const loginCall = page.waitForRequest(
        (req) => req.url().includes(ENDPOINT) && req.method() === 'POST',
      )

      await login.visit()
      await login.toggleUseApi()
      await login.fillEmail(VALID.email)
      await login.fillPassword(VALID.password)
      await login.submit()

      const request = await loginCall
      const response = await request.response()
      expect(request.postDataJSON().email).toBe(VALID.email)
      expect(response!.status()).toBe(200)
    })

    test('stubbed 500 keeps user on login page without crashing', async ({ page }) => {
      await page.route('**/api/auth/login', (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        }),
      )

      const login = new LoginPage(page)
      await login.visit()
      await login.toggleUseApi()
      await login.loginWith(VALID.email, VALID.password)

      await expect(page).toHaveURL(/\/web\/login\.html/)
    })
  })
```

- **Dado:** página de login com toggle de API ou 500 stubado.
- **Quando:** usuário submete credenciais.
- **Então:** contrato de rede é verificado ou erro é tratado graciosamente sem navegação.

---

## Como executar

```bash
npm run test:api
npx playwright test tests/api/auth.api.spec.ts
```

---

## Referências relacionadas

- Helpers de auth: [`support/auth.ts`](../../../../support/auth.ts)
- Saúde API smoke (subset): [`tests/smoke/navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)
- Suite UI de login: [`tests/auth/login.spec.ts`](../../../../tests/auth/login.spec.ts)
