# Autenticação — Login

**Arquivo fonte:** [`login.spec.ts`](../../../../tests/auth/login.spec.ts)

---

## Objetivo

Esta suite valida o **fluxo completo de autenticação** da aplicação TestFlow pela tela de login. Ela cobre:

- Estrutura do formulário e atributos dos campos
- Login bem-sucedido (UI pura e com toggle de API)
- Persistência de sessão no `sessionStorage`
- Rejeição de credenciais inválidas
- Validação HTML5 e comportamento do checkbox "Remember me"
- Proteção de rotas e redirect pós-login
- Logout a partir de sessão autenticada

É a base para entender como [`LoginPage`](../../../../pages/LoginPage.ts) encapsula seletores e ações reutilizáveis.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais DEMO** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Fixture** | [`credentials.json`](../../../../fixtures/credentials.json) com pares válidos/inválidos para testes negativos |
| **Execução** | `npm run test:auth` |

---

## Tags utilizadas

Este spec não possui tags Playwright explícitas. Roda no projeto `auth` em `playwright.config.ts`.

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| **Page Object** | [`LoginPage`](../../../../pages/LoginPage.ts) — métodos fluentes (`loginWith`, `shouldRedirectToDashboard`) |
| **Aninhamento de `test.describe`** | Agrupa testes por tema (estrutura, credenciais válidas, inválidas, etc.) |
| **`page.waitForRequest`** | Espiona `POST /api/auth/login` quando o toggle "Use API" está ativo |
| **`page.evaluate()`** | Inspeciona `sessionStorage` após login |
| **Fixture `credentials.json`** | Carrega pares email/senha válidos/inválidos para testes negativos |
| **`storageState`** | O projeto auth usa estado pré-salvo do `globalSetup`, mas os testes de login começam não autenticados via `LoginPage.visit()` |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup e Page Object

```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'
import credentials from '../../fixtures/credentials.json'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).visit()
  })
```

- **Dado:** cada teste começa na página de login.
- **Quando:** `LoginPage.visit()` navega para `/web/login.html`.
- **Então:** estado limpo — nenhuma sessão prévia assumida (exceto onde o teste cria uma).

---

### Bloco 2 — Estrutura da página

```typescript
  test.describe('Page structure', () => {
    test('renders all form elements', async ({ page }) => {
      const login = new LoginPage(page)
      await expect(login.emailInput()).toBeVisible()
      await expect(login.passwordInput()).toBeVisible()
      await expect(login.submitBtn()).toBeVisible()
      await expect(login.submitBtn()).toBeEnabled()
      await expect(login.rememberCheckbox()).toBeAttached()
      await expect(login.useApiCheckbox()).toBeAttached()
    })
```

- **Dado:** a página de login está carregada.
- **Quando:** elementos do formulário são consultados via métodos do Page Object.
- **Então:** email, senha, submit, remember-me e toggle de API estão presentes e interativos.

---

### Bloco 3 — Credenciais válidas

```typescript
  test.describe('Valid credentials', () => {
    test('logs in via UI and redirects to dashboard', async ({ page }) => {
      const login = new LoginPage(page)
      await login.loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      await login.shouldRedirectToDashboard()
    })
```

- **Dado:** credenciais DEMO válidas.
- **Quando:** o usuário submete o formulário de login.
- **Então:** o browser navega para o dashboard.

**Teste com toggle de API:**

```typescript
    test('logs in with API toggle enabled', async ({ page }) => {
      const login = new LoginPage(page)
      const loginRequest = page.waitForRequest((req) =>
        req.url().includes('/api/auth/login') && req.method() === 'POST',
      )

      await login.toggleUseApi()
      await login.loginWith(DEMO_EMAIL, DEMO_PASSWORD)

      const request = await loginRequest
      const response = await request.response()
      expect(response?.status()).toBe(200)
      await login.shouldRedirectToDashboard()
    })
```

- **Dado:** o checkbox "Use API" está habilitado.
- **Quando:** o login é submetido.
- **Então:** um POST para `/api/auth/login` retorna 200 e o usuário chega ao dashboard.

**Session storage:**

```typescript
    test('sets auth data in sessionStorage after login', async ({ page }) => {
      await new LoginPage(page).loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      const auth = await page.evaluate(() => {
        const raw = sessionStorage.getItem('sandbox-auth')
        return raw ? JSON.parse(raw) : null
      })
      expect(auth).not.toBeNull()
      expect(auth.email).toBe(DEMO_EMAIL)
    })
```

- **Dado:** um login via UI bem-sucedido.
- **Quando:** `sessionStorage` é lido via `page.evaluate`.
- **Então:** `sandbox-auth` contém o email do usuário.

---

### Bloco 4 — Credenciais inválidas

```typescript
  test.describe('Invalid credentials', () => {
    test('shows error for wrong password', async ({ page }) => {
      const login = new LoginPage(page)
      await login.loginWith(credentials.valid.email, credentials.invalid.password)
      await login.shouldShowError('Invalid credentials')
    })
```

- **Dado:** email válido com senha errada da fixture.
- **Quando:** tentativa de login.
- **Então:** mensagem de erro é exibida e o usuário permanece na página de login.

---

### Bloco 5 — Validação do formulário & Remember me

```typescript
  test.describe('Form validation', () => {
    test('requires email to not be empty (HTML5 validation)', async ({ page }) => {
      const login = new LoginPage(page)
      await login.fillPassword(DEMO_PASSWORD)
      await login.submit()
      const isValid = await login.emailInput().evaluate((el) => (el as HTMLInputElement).validity.valid)
      expect(isValid).toBe(false)
    })
  })
```

- **Dado:** o campo email está vazio.
- **Quando:** submit é clicado com apenas a senha preenchida.
- **Então:** a validação HTML5 falha no campo email.

---

### Bloco 6 — Redirect & Logout

```typescript
  test.describe('Redirect after login', () => {
    test('redirects to login when accessing a protected page unauthenticated', async ({ page }) => {
      await page.goto('/web/team.html')
      await expect(page).toHaveURL(/\/web\/login\.html/)

      await new LoginPage(page).loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      await expect(page).not.toHaveURL(/\/web\/login\.html/)
    })
  })
```

- **Dado:** um usuário não autenticado tenta abrir `/web/team.html`.
- **Quando:** o app redireciona ao login e o usuário se autentica.
- **Então:** ele não está mais na página de login.

---

## Como executar

```bash
# Projeto auth
npm run test:auth

# Apenas este arquivo
npx playwright test tests/auth/login.spec.ts

# Modo UI interativo
npm run test:ui -- tests/auth/login.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/LoginPage.ts`](../../../../pages/LoginPage.ts)
- Fixture de credenciais: [`fixtures/credentials.json`](../../../../fixtures/credentials.json)
- Helpers de auth: [`support/auth.ts`](../../../../support/auth.ts)
