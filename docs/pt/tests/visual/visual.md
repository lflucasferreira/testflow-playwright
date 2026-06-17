# Visual Regression — Regiões estáveis da UI

**Arquivo fonte:** [`visual.spec.ts`](../../../../tests/visual/visual.spec.ts)

---

## Objetivo

Esta suite valida **visual regression** usando comparação de screenshot nativa do Playwright (`toHaveScreenshot`). Ela cobre três regiões estáveis da UI:

1. **Formulário de login** — layout do card não autenticado
2. **Navegação da sidebar** — links da sidebar autenticada
3. **Botões Components** — seção de variantes de botão primário

Snapshots ficam ao lado do spec em pastas `-snapshots/` e são comparados com ratio máximo de diferença de pixels de 5%.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` para screenshots autenticados |
| **Baselines** | PNGs de snapshot em `tests/visual/visual.spec.ts-snapshots/` |
| **Execução** | `npm run test:visual` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@visual` | `test.describe` de nível superior | Suite de visual regression |
| `@regression` | `test.describe` de nível superior | Incluído no grep de regressão completa |

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`toHaveScreenshot`](https://playwright.dev/docs/test-snapshots) | Compara screenshot do elemento com baseline PNG |
| **`page.emulateMedia({ reducedMotion: 'reduce' })`** | Desabilita animações para capturas estáveis |
| **`document.fonts.ready`** | Aguarda web fonts antes do screenshot |
| [`loginViaApi`](../../../../support/auth.ts) | Autentica para shots de sidebar/components |
| **`SCREENSHOT_OPTS`** | Compartilhado `{ animations: 'disabled', maxDiffPixelRatio: 0.05 }` |
| **`snapshotPathTemplate`** | Configurado em [`playwright.config.ts`](../../../../playwright.config.ts) |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Opções compartilhadas e setup

```typescript
import { test, expect } from '@playwright/test'
import { loginViaApi } from '../../support/auth'

const SCREENSHOT_OPTS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.05,
}

test.describe('Visual regression — stable UI regions', { tag: ['@visual', '@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })
```

- **Dado:** cada teste desabilita motion para renderização determinística.
- **Quando:** `beforeEach` roda antes de cada teste de screenshot.
- **Então:** animações e transições CSS são minimizadas.

---

### Bloco 2 — Baseline do formulário de login

```typescript
  test('login form matches baseline', async ({ page }) => {
    await page.goto('/web/login.html', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('login-email')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.getByTestId('login-card')).toHaveScreenshot('login-form.png', SCREENSHOT_OPTS)
  })
```

- **Dado:** a página de login está totalmente carregada com fonts prontas.
- **Quando:** `toHaveScreenshot` captura `login-card`.
- **Então:** diferença de pixels contra baseline `login-form.png` é ≤ 5%.

---

### Bloco 3 — Baseline da navegação da sidebar

```typescript
  test('sidebar navigation matches baseline when authenticated', async ({ page, request }) => {
    await loginViaApi(page, request)
    await expect(page.getByTestId('site-sidebar')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.getByTestId('site-sidebar')).toHaveScreenshot('sidebar-nav.png', SCREENSHOT_OPTS)
  })
```

- **Dado:** sessão autenticada no dashboard.
- **Quando:** o elemento sidebar é capturado.
- **Então:** links de navegação conferem com o baseline armazenado.

---

### Bloco 4 — Baseline dos botões Components

```typescript
  test('components primary buttons match baseline', async ({ page, request }) => {
    await loginViaApi(page, request)
    await page.goto('/web/components.html', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('page-components')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.getByTestId('section-buttons')).toHaveScreenshot(
      'components-buttons.png',
      SCREENSHOT_OPTS,
    )
  })
```

- **Dado:** a seção de botões da página Components está visível.
- **Quando:** `section-buttons` é capturado.
- **Então:** variantes de botão conferem com o baseline armazenado.

---

## Como executar

```bash
# Executar visual regression
npm run test:visual

# Atualizar baselines após mudanças intencionais de UI
npm run test:visual:update

# Teste único
npx playwright test tests/visual/visual.spec.ts --project=visual
```

---

## Referências relacionadas

- Snapshots no Playwright config: [`playwright.config.ts`](../../../../playwright.config.ts)
- Suite Components (funcional): [`tests/components/components.spec.ts`](../../../../tests/components/components.spec.ts)
