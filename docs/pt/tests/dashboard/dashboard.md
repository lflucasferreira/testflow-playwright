# Dashboard

**Arquivo fonte:** [`dashboard.spec.ts`](../../../../tests/dashboard/dashboard.spec.ts)

---

## Objetivo

Esta suite valida a **página Dashboard** — a tela principal após autenticação. Ela cobre:

- Saudação baseada em horário e subtítulo
- Cards KPI com valores numéricos, percentuais e indicadores de tendência
- Feed de atividade recente e navegação "See all"
- Barras de status de saúde das suites
- Modal "New test run" (abrir, fechar, confirmar)
- Links de acesso rápido

Demonstra o Page Object [`DashboardPage`](../../../../pages/DashboardPage.ts) e `loginViaApi` para setup autenticado rápido.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Execução** | `npm run test:dashboard` |

---

## Tags utilizadas

Este spec não possui tags Playwright explícitas. Roda no projeto `dashboard`.

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`loginViaApi`](../../../../support/auth.ts) | Autentica via API antes de cada teste |
| **Page Object** | [`DashboardPage`](../../../../pages/DashboardPage.ts) — helpers de KPI, modal e activity |
| **`page.keyboard.press('Escape')`** | Fecha modal via teclado |
| **`click({ force: true })`** | Clica no overlay do modal para dispensar |
| **Testes parametrizados** | Loop `for...of` gera testes de links de acesso rápido |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { DashboardPage } from '../../pages/DashboardPage'
import { loginViaApi } from '../../support/auth'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request)
    await new DashboardPage(page).shouldBeLoaded()
  })
```

- **Dado:** cada teste começa autenticado no dashboard.
- **Quando:** `loginViaApi` injeta sessão e navega para `/web/dashboard.html`.
- **Então:** a raiz `page-dashboard` fica visível.

---

### Bloco 2 — Saudação & cards KPI

```typescript
  test.describe('Greeting', () => {
    test('shows time-based greeting with the user name', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.shouldShowGreeting()
      await expect(dashboard.greeting()).toContainText('Demo User')
    })
  })

  test.describe('KPI cards', () => {
    test('renders all four KPI cards', async ({ page }) => {
      await new DashboardPage(page).shouldHaveAllKpiCards()
    })

    test('shows a numeric value in the runs card', async ({ page }) => {
      const text = await new DashboardPage(page).kpiValue('runs').innerText()
      expect(parseInt(text, 10)).toBeGreaterThan(0)
    })
  })
```

- **Dado:** o dashboard está carregado com dados do usuário demo.
- **Quando:** saudação e elementos KPI são inspecionados.
- **Então:** a saudação contém "Demo User" e os cards KPI exibem valores numéricos/percentuais com indicadores de tendência.

---

### Bloco 3 — Atividade recente & saúde das suites

```typescript
  test.describe('Recent activity', () => {
    test('shows 5 activity items', async ({ page }) => {
      await new DashboardPage(page).shouldHaveActivityItems(5)
    })

    test('"See all" link navigates to activity page', async ({ page }) => {
      await new DashboardPage(page).quickAction('team')
      await page.getByTestId('activity-see-all').click()
      await expect(page).toHaveURL(/\/web\/activity\.html/)
    })
  })
```

- **Dado:** a seção de activity está renderizada.
- **Quando:** "See all" é clicado.
- **Então:** o browser navega para a página Activity.

---

### Bloco 4 — Modal "New test run"

```typescript
  test.describe('"New test run" modal', () => {
    test('opens modal on button click', async ({ page }) => {
      await new DashboardPage(page).openNewRunModal()
      await new DashboardPage(page).shouldShowRunModalOpen()
    })

    test('confirms a run and shows toast', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.openNewRunModal()
      await dashboard.selectSuite('smoke')
      await dashboard.selectEnvironment('staging')
      await dashboard.confirmRun()
      await dashboard.shouldShowRunModalClosed()
      await expect(page.getByTestId('toast-message')).toContainText('smoke')
    })
  })
```

- **Dado:** o dashboard está carregado.
- **Quando:** o usuário abre o modal, seleciona suite/ambiente e confirma.
- **Então:** o modal fecha e um toast confirma a execução.

**Comportamentos de fechamento testados:** botão Cancel, tecla Escape, clique no overlay.

---

### Bloco 5 — Navegação de acesso rápido

```typescript
  test.describe('Quick access navigation', () => {
    const links = [
      { testId: 'qa-team', path: '/web/team.html' },
      { testId: 'qa-settings', path: '/web/settings.html' },
      { testId: 'qa-wizard', path: '/web/wizard.html' },
    ]

    for (const { testId, path } of links) {
      test(`"${testId}" navigates to ${path}`, async ({ page }) => {
        await page.getByTestId(testId).click()
        await expect(page).toHaveURL(new RegExp(path.replace('.', '\\.')))
        await page.goBack()
      })
    }
  })
```

- **Dado:** cards de acesso rápido estão visíveis no dashboard.
- **Quando:** cada card é clicado.
- **Então:** a URL confere com a página esperada e o teste volta com `goBack`.

---

## Como executar

```bash
npm run test:dashboard
npx playwright test tests/dashboard/dashboard.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/DashboardPage.ts`](../../../../pages/DashboardPage.ts)
- Helpers de auth: [`support/auth.ts`](../../../../support/auth.ts)
