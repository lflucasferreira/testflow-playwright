# Advanced — iframe, Shadow DOM & links externos

**Arquivo fonte:** [`advanced.spec.ts`](../../../../tests/advanced/advanced.spec.ts)

---

## Objetivo

Esta suite valida a **página Advanced** — cenários desafiadores de DOM incluindo Shadow DOM, iframes, viewports responsivos e links externos. Ela cobre:

- Anexação do shadow host e acesso ao conteúdo
- Carregamento do iframe demo e navegação via `frameLocator`
- Renderização em viewport mobile
- Atributos de segurança de links externos (`rel="noopener"`)
- Navegação de página (botões Finish/Back)
- Visibilidade de seções

Demonstra [`AdvancedPage`](../../../../pages/AdvancedPage.ts) e as APIs de iframe/shadow DOM do Playwright.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Execução** | `npm run test:advanced` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `test.describe` de nível superior | Incluído no grep de regressão completa |

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | Login via API + navegação para `/web/advanced.html` |
| **Page Object** | [`AdvancedPage`](../../../../pages/AdvancedPage.ts) — helpers de shadow e iframe |
| **`frameLocator()`** | Acessa o body do documento do iframe |
| **`page.setViewportSize`** | Testa layout mobile via [`VIEWPORTS`](../../../../support/constants/viewports.ts) |
| **`element.evaluate()`** | Verifica `isConnected` no shadow host |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { AdvancedPage } from '../../pages/AdvancedPage'
import { visitAuthenticated } from '../../support/auth'
import { VIEWPORTS } from '../../support/constants/viewports'

test.describe('Advanced — iframe, shadow DOM & external links', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/advanced.html')
    await expect(new AdvancedPage(page).pageRoot()).toBeVisible()
  })
```

- **Dado:** cada teste começa autenticado na página Advanced.
- **Quando:** `visitAuthenticated` injeta sessão e navega.
- **Então:** a raiz `page-advanced` fica visível.

---

### Bloco 2 — Shadow DOM

```typescript
  test.describe('Shadow DOM', () => {
    test('renders shadow DOM section and host element', async ({ page }) => {
      await new AdvancedPage(page).shouldShowShadowSection()
    })

    test('accesses content inside shadow root', async ({ page }) => {
      const advanced = new AdvancedPage(page)
      const count = await advanced.shadowContentCount()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    test('shadow host is attached to the document', async ({ page }) => {
      const attached = await page.getByTestId('shadow-host').evaluate((el) => el.isConnected)
      expect(attached).toBe(true)
    })
  })
```

- **Dado:** um custom element com shadow root aberto.
- **Quando:** o Page Object atravessa o boundary do shadow.
- **Então:** conteúdo shadow é acessível e o host está conectado ao DOM.

---

### Bloco 3 — Iframe

```typescript
  test.describe('Iframe', () => {
    test('loads demo iframe with a valid src', async ({ page }) => {
      await new AdvancedPage(page).shouldHaveIframeSrc()
    })

    test('iframe document body is reachable via frameLocator', async ({ page }) => {
      const advanced = new AdvancedPage(page)
      await expect(advanced.demoIframe()).toBeVisible()
      const frameBody = advanced.iframeFrame().locator('body')
      await expect(frameBody).toBeAttached({ timeout: 10_000 })
    })
  })
```

- **Dado:** um iframe demo embutido com atributo title.
- **Quando:** `frameLocator` aponta para o iframe.
- **Então:** o body do documento interno está attached e acessível.

---

### Bloco 4 — Responsivo & links externos

```typescript
  test.describe('Responsive', () => {
    test('shadow section renders at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE)
      await new AdvancedPage(page).shouldShowShadowSection()
      await page.setViewportSize(VIEWPORTS.DESKTOP)
    })
  })

  test.describe('External links', () => {
    test('external link has rel noopener for security', async ({ page }) => {
      const rel = await page.getByTestId('external-link').getAttribute('rel')
      expect(rel ?? '').toMatch(/noopener/)
    })
  })
```

- **Dado:** constantes de viewport para mobile (375×667) e desktop (1280×800).
- **Quando:** viewport é redimensionado para mobile.
- **Então:** seção shadow permanece visível; links externos incluem `noopener`.

---

### Bloco 5 — Navegação & estrutura

```typescript
  test.describe('Navigation', () => {
    test('Finish button navigates away from advanced page', async ({ page }) => {
      await page.getByTestId('page-finish-btn').click()
      await expect(page).not.toHaveURL(/\/web\/advanced\.html/)
    })
  })

  test.describe('Page structure', () => {
    test('all advanced sections are visible', async ({ page }) => {
      for (const id of ['section-shadow', 'section-iframe', 'section-external']) {
        await expect(page.getByTestId(id)).toBeVisible()
      }
    })
  })
```

- **Dado:** botões Finish e Back na página.
- **Quando:** Finish é clicado.
- **Então:** URL não contém mais `/web/advanced.html`.

---

## Como executar

```bash
npm run test:advanced
npx playwright test tests/advanced/advanced.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/AdvancedPage.ts`](../../../../pages/AdvancedPage.ts)
- Constantes de viewport: [`support/constants/viewports.ts`](../../../../support/constants/viewports.ts)
