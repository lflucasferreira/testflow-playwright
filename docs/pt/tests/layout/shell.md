# App Shell — Layout, navegação & notificações

**Arquivo fonte:** [`shell.spec.ts`](../../../../tests/layout/shell.spec.ts)

---

## Objetivo

Esta suite valida o **app shell** — elementos persistentes de layout compartilhados entre páginas autenticadas. Ela cobre:

- Sidebar, topbar, breadcrumb e exibição do nome do usuário
- Link de acessibilidade skip-to-content
- Navegação pela sidebar para todas as rotas principais com highlight ativo
- Dropdown de notificações, contagem do badge e mark-all-read
- Toggle de tema com persistência em `localStorage`
- Shell responsivo em viewport mobile

Demonstra [`ShellPage`](../../../../pages/ShellPage.ts) e testes de navegação parametrizados.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Execução** | `npm run test:layout` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `test.describe` de nível superior | Incluído no grep de regressão completa |

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`loginViaApi`](../../../../support/auth.ts) | Autentica e aterrisa no dashboard |
| **Page Object** | [`ShellPage`](../../../../pages/ShellPage.ts) — landmarks do shell e helpers de nav |
| **`ShellPage.navItems()`** | Método estático retorna metadados dos links de nav para testes parametrizados |
| **`expect.poll`** | Faz polling da contagem de notificações não lidas até zero |
| **`toBeInViewport()`** | Verifica conteúdo principal após skip link |
| **`page.setViewportSize`** | Teste de shell mobile via [`VIEWPORTS`](../../../../support/constants/viewports.ts) |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { ShellPage } from '../../pages/ShellPage'
import { loginViaApi } from '../../support/auth'
import { VIEWPORTS } from '../../support/constants/viewports'

test.describe('App shell — layout, navigation & notifications', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request)
    await new ShellPage(page).shouldShowAppShell()
  })
```

- **Dado:** cada teste começa autenticado no dashboard com o app shell visível.
- **Quando:** `loginViaApi` injeta sessão e navega.
- **Então:** sidebar e topbar estão presentes.

---

### Bloco 2 — Landmarks de layout

```typescript
  test.describe('Layout landmarks', () => {
    test('sidebar, topbar and breadcrumb are visible on dashboard', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.shouldShowAppShell()
      await expect(shell.breadcrumb()).toBeVisible()
      await expect(shell.userName()).toContainText('Demo User')
    })

    test('main content region is reachable after skip link', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.skipToMainContent()
      await expect(page).toHaveURL(/#main-content$/)
      await expect(page.locator('#main-content')).toBeInViewport()
    })
  })
```

- **Dado:** o shell do dashboard está renderizado.
- **Quando:** skip-to-content é ativado.
- **Então:** hash da URL é `#main-content` e a região main está no viewport.

---

### Bloco 3 — Navegação pela sidebar (parametrizada)

```typescript
  test.describe('Sidebar navigation', () => {
    for (const { testId, path, pageTestId } of ShellPage.navItems()) {
      test(`navigates to ${path} via ${testId}`, async ({ page }) => {
        const shell = new ShellPage(page)
        await shell.navigateViaSidebar(testId)
        await expect(page).toHaveURL(new RegExp(path.replace('.', '\\.')))
        await expect(page.getByTestId(pageTestId)).toBeVisible()
        await shell.shouldHighlightNav(testId)
      })
    }
  })
```

- **Dado:** itens de nav da sidebar definidos no Page Object.
- **Quando:** cada link é clicado programaticamente.
- **Então:** URL, raiz da página e highlight ativo da nav conferem.

---

### Bloco 4 — Notificações

```typescript
  test.describe('Notifications', () => {
    test('mark all read clears or reduces badge', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.openNotifications()
      const before = await shell.getUnreadCount()
      expect(before).toBeGreaterThan(0)

      await shell.markAllNotificationsRead()
      await expect.poll(() => shell.getUnreadCount()).toBe(0)
      await expect(shell.notifBadge()).toBeHidden()
    })
  })
```

- **Dado:** notificações não lidas com contagem no badge.
- **Quando:** "Mark all read" é clicado.
- **Então:** contagem não lida cai para 0 e o badge some.

---

### Bloco 5 — Toggle de tema

```typescript
  test.describe('Theme toggle', () => {
    test('theme toggle switches data-theme and persists in localStorage', async ({ page }) => {
      const shell = new ShellPage(page)
      const before = await shell.getTheme()

      await shell.toggleTheme()
      const after = await shell.getTheme()
      expect(after).not.toBe(before)

      const stored = await page.evaluate(() => localStorage.getItem('sandbox-theme'))
      expect(stored).toBe(after)
    })
  })
```

- **Dado:** um tema (light ou dark) está ativo.
- **Quando:** o toggle de tema é clicado.
- **Então:** `data-theme` muda e `sandbox-theme` é salvo no `localStorage`.

---

### Bloco 6 — Shell responsivo

```typescript
  test.describe('Responsive shell', () => {
    test('shell remains usable at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE)
      const shell = new ShellPage(page)
      await shell.shouldShowAppShell()
      await shell.navigateViaSidebar('nav-team')
      await expect(page.getByTestId('page-team')).toBeVisible()
    })
  })
```

- **Dado:** viewport mobile (375×667).
- **Quando:** navegação pela sidebar para Team é tentada.
- **Então:** shell e página de destino permanecem funcionais.

---

## Como executar

```bash
npm run test:layout
npx playwright test tests/layout/shell.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/ShellPage.ts`](../../../../pages/ShellPage.ts)
- Navegação smoke (subset da sidebar): [`tests/smoke/navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)
