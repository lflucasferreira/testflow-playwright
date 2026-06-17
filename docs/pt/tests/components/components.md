# Components

**Arquivo fonte:** [`components.spec.ts`](../../../../tests/components/components.spec.ts)

---

## Objetivo

Esta suite valida a **página Components showcase** — padrões reutilizáveis de UI incluindo botões, modais, tabs e accordions. Ela cobre:

- Variantes de botão, estado disabled, spinner de loading e toast
- Tratamento de diálogos nativos alert/confirm
- Comportamentos de abrir/fechar modal e atributos ARIA
- Navegação por tabs com `aria-selected` e visibilidade de painéis
- Expandir/colapsar accordion com `aria-expanded`

Demonstra [`ComponentsPage`](../../../../pages/ComponentsPage.ts) e tratamento de diálogos no Playwright.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Execução** | `npm run test:components` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `test.describe` de nível superior | Incluído no grep de regressão completa |

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | Login via API + navegação para `/web/components.html` |
| **Page Object** | [`ComponentsPage`](../../../../pages/ComponentsPage.ts) |
| **`page.once('dialog')`** | Trata `alert()` e `confirm()` nativos |
| **`toHaveAttribute('role', 'dialog')`** | Verificações de acessibilidade no modal |
| **`page.keyboard.press('Escape')`** | Fecha modal via teclado |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { ComponentsPage } from '../../pages/ComponentsPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Components', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/components.html')
    await new ComponentsPage(page).shouldShowPage()
  })
```

- **Dado:** cada teste começa autenticado na página Components.
- **Quando:** `visitAuthenticated` injeta sessão e navega.
- **Então:** a raiz `page-components` fica visível.

---

### Bloco 2 — Botões

```typescript
  test.describe('Buttons', () => {
    test('all button variants are visible', async ({ page }) => {
      const components = new ComponentsPage(page)
      for (const id of ['btn-primary', 'btn-secondary', 'btn-success', 'btn-danger']) {
        const btn = components.button(id)
        await expect(btn).toBeVisible()
        await expect(btn).toBeEnabled()
      }
    })

    test('loading button shows spinner during simulated load', async ({ page }) => {
      await new ComponentsPage(page).button('btn-loading').click()
      await expect(page.getByTestId('btn-loading')).toBeDisabled()
      await expect(page.locator('.spinner')).toBeVisible()
      await expect(page.getByTestId('btn-loading')).toBeEnabled({ timeout: 5000 })
    })
  })
```

- **Dado:** a seção de botões está renderizada.
- **Quando:** variantes são inspecionadas ou o botão loading é clicado.
- **Então:** todas as variantes estão habilitadas; o botão loading exibe spinner e reabilita depois.

**Diálogos nativos:**

```typescript
    test('native confirm returns true on accept', async ({ page }) => {
      page.once('dialog', (dialog) => dialog.accept())
      await new ComponentsPage(page).button('btn-confirm').click()
      await expect(new ComponentsPage(page).dialogResult()).toContainText('Confirmed')
    })
```

- **Dado:** um botão confirm dispara `window.confirm`.
- **Quando:** o Playwright aceita o diálogo.
- **Então:** a área de resultado exibe "Confirmed".

---

### Bloco 3 — Modal

```typescript
  test.describe('Modal', () => {
    test.beforeEach(async ({ page }) => {
      await new ComponentsPage(page).openModal()
    })

    test('has accessible role dialog', async ({ page }) => {
      const modal = new ComponentsPage(page).modalOverlay()
      await expect(modal).toHaveAttribute('role', 'dialog')
      await expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    test('closes on Escape key', async ({ page }) => {
      await page.keyboard.press('Escape')
      await expect(new ComponentsPage(page).modalOverlay()).not.toBeVisible()
    })
  })
```

- **Dado:** o modal está aberto (via `beforeEach`).
- **Quando:** atributos de acessibilidade ou ações de fechamento são testados.
- **Então:** o modal possui roles ARIA corretos; fecha via Confirm, Cancel, ✕, Escape ou clique no overlay.

---

### Bloco 4 — Tabs

```typescript
  test.describe('Tabs', () => {
    test('Overview tab is active by default', async ({ page }) => {
      const components = new ComponentsPage(page)
      await expect(components.tabOverview()).toHaveAttribute('aria-selected', 'true')
      await expect(components.tabPanelOverview()).toBeVisible()
    })

    test('clicking Playwright tab activates it and shows its panel', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.tabPlaywright().click()
      await expect(components.tabPlaywright()).toHaveAttribute('aria-selected', 'true')
      await expect(components.tabPanelPlaywright()).toBeVisible()
    })
  })
```

- **Dado:** três tabs com painéis associados.
- **Quando:** uma tab é clicada.
- **Então:** apenas essa tab fica com `aria-selected="true"` e seu painel fica visível.

---

### Bloco 5 — Accordion

```typescript
  test.describe('Accordion', () => {
    test('all panels are collapsed by default', async ({ page }) => {
      const components = new ComponentsPage(page)
      for (const n of [1, 2, 3]) {
        await expect(components.accordionTrigger(n)).toHaveAttribute('aria-expanded', 'false')
        await expect(components.accordionPanel(n)).not.toBeVisible()
      }
    })

    test('multiple panels can be open simultaneously', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.accordionTrigger(1).click()
      await components.accordionTrigger(2).click()
      await expect(components.accordionPanel(1)).toBeVisible()
      await expect(components.accordionPanel(2)).toBeVisible()
    })
  })
```

- **Dado:** três painéis de accordion, todos colapsados.
- **Quando:** triggers são clicados.
- **Então:** painéis expandem de forma independente (não exclusiva).

---

## Como executar

```bash
npm run test:components
npx playwright test tests/components/components.spec.ts
npm run test:grep:regression -- tests/components/components.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/ComponentsPage.ts`](../../../../pages/ComponentsPage.ts)
- Suite A11y (scan do modal): [`tests/a11y/a11y.spec.ts`](../../../../tests/a11y/a11y.spec.ts)
