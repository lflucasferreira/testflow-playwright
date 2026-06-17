# Classic Widgets — Padrões QA School

**Arquivo fonte:** [`widgets.spec.ts`](../../../../tests/widgets/widgets.spec.ts)

---

## Objetivo

Esta suite valida a **página Classic Widgets** — padrões legados de UI de escola de QA incluindo checkboxes, upload de arquivo, modais, Select2, SweetAlert2, drag-and-drop e iframes cross-origin. Ela cobre:

- Checkboxes pré-marcados e seleção de radio
- Upload de arquivo com feedback toast
- Tabela de jobs e modal de detalhe
- Select nativo e toggle enable/disable
- Tratamento de alert nativo e formulário cadastro
- Captions em hover e atalhos de teclado
- Select2 single/multi select e toggle disable
- Diálogo SweetAlert2
- Swap HTML5 drag-and-drop
- Popup de nova aba via `context.waitForEvent('page')`
- Embeds de iframe YouTube

Demonstra [`WidgetsPage`](../../../../pages/WidgetsPage.ts) e interação com widgets de terceiros.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Fixtures** | [`fixtures/sample-upload.txt`](../../../../fixtures/sample-upload.txt) |
| **Execução** | `npm run test:widgets` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `test.describe` de nível superior | Incluído no grep de regressão completa |

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | Login via API + navegação para `/web/widgets.html` |
| **Page Object** | [`WidgetsPage`](../../../../pages/WidgetsPage.ts) |
| **`check({ force: true })`** | Marca inputs radio ocultos |
| **`setInputFiles` / `uploadSampleFile()`** | Simulação de upload de arquivo |
| **`page.once('dialog')`** | Aceitação de alert nativo |
| **`context.waitForEvent('page')`** | Captura popup de nova aba |
| **`dispatchEvent('dragenter')`** | Simula estado hover de drag |
| **Locators CSS** | `.select2-container`, `.swal2-popup` para widgets de vendor |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { WidgetsPage } from '../../pages/WidgetsPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Classic Widgets — QA School patterns', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/widgets.html')
    await new WidgetsPage(page).shouldShowPage()
  })
```

- **Dado:** cada teste começa autenticado na página Widgets.
- **Quando:** `visitAuthenticated` injeta sessão e navega.
- **Então:** a raiz `page-widgets` fica visível.

---

### Bloco 2 — Checkboxes, radios & upload de arquivo

```typescript
  test.describe('Checkboxes & radios', () => {
    test('shows pre-checked Ruby and PHP', async ({ page }) => {
      await expect(page.getByTestId('cb-ruby')).toBeChecked()
      await expect(page.getByTestId('cb-php')).toBeChecked()
      await expect(page.getByTestId('cb-java')).not.toBeChecked()
    })
  })

  test.describe('File upload', () => {
    test('enables upload after selecting a file', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await expect(widgets.uploadBtn()).toBeDisabled()
      await widgets.uploadSampleFile()
      await expect(page.getByTestId('file-label')).toContainText('sample-upload.txt')
      await expect(page.getByTestId('toast-message')).toContainText(/upload/i)
    })
  })
```

- **Dado:** estados padrão de checkbox e botão de upload desabilitado.
- **Quando:** um arquivo é selecionado via helper do Page Object.
- **Então:** label atualiza e toast de upload aparece.

---

### Bloco 3 — Tabela de jobs & modal

```typescript
  test.describe('Jobs table & modal', () => {
    test('opens job detail modal for Amazon row', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.openJobDetails('job-detail-amazon')
      await expect(widgets.jobModalContent()).toContainText(/Amazon|QA/i)
      await widgets.jobModalClose().click()
      await expect(widgets.jobModalOverlay()).not.toBeVisible()
    })
  })
```

- **Dado:** tabela de jobs com três linhas de empresas.
- **Quando:** um link de detalhe do job é clicado.
- **Então:** modal abre com info da empresa e fecha no ✕.

---

### Bloco 4 — Select2

```typescript
  test.describe('Select2', () => {
    test('selects OS via Select2 dropdown', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.selectOsOption('Linux')
      await expect(widgets.select2Os()).toHaveValue('LINUX')
    })

    test('multi-select accepts multiple OS values', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await page.locator('[data-testid="section-select2-multi"] .select2-container').click()
      await page.locator('.select2-results__option', { hasText: 'Linux' }).click()
      await page.locator('[data-testid="section-select2-multi"] .select2-container').click()
      await page.locator('.select2-results__option', { hasText: 'MacOS' }).click()
      await expect(page.locator('[data-testid="section-select2-multi"] .select2-selection__choice')).toHaveCount(2)
    })
  })
```

- **Dado:** dropdowns aprimorados com Select2.
- **Quando:** opções são selecionadas via UI do vendor.
- **Então:** valores do `<select>` subjacente refletem LINUX/MACOS.

---

### Bloco 5 — SweetAlert2 & Drag-and-drop

```typescript
  test.describe('SweetAlert2', () => {
    test('shows success dialog after click', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.sweetAlertBtn().click()
      await expect(page.locator('.swal2-popup')).toBeVisible()
      await expect(page.locator('.swal2-title')).toContainText('Congratulations!')
      await page.locator('.swal2-confirm').click()
      await expect(page.locator('.swal2-popup')).toBeHidden()
    })
  })

  test.describe('Drag & drop swap', () => {
    test('swaps content between drag boxes (HTML5 drop with empty getData)', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.swapDragBoxesComplete()
      await expect(widgets.dragBox2()).toHaveText('Drag me')
      await expect(widgets.dragBox1().locator('img[alt="loader"]')).toBeVisible()
    })
  })
```

- **Dado:** trigger SweetAlert e duas caixas arrastáveis.
- **Quando:** alert é confirmado ou swap de drag completa.
- **Então:** popup fecha; conteúdos das caixas são trocados.

---

### Bloco 6 — Nova aba & iframes

```typescript
  test.describe('New tab', () => {
    test('opens example.com in a new tab', async ({ page, context }) => {
      const widgets = new WidgetsPage(page)
      const popupPromise = context.waitForEvent('page')
      await widgets.openNewTabBtn().click()
      const popup = await popupPromise
      await expect(popup).toHaveURL(/example\.com/)
      await popup.close()
    })
  })

  test.describe('Cross-origin iframes', () => {
    test('YouTube embeds load with valid src and title', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await expect(widgets.iframeYoutubeEasy()).toHaveAttribute('src', /youtube\.com\/embed/)
      await expect(widgets.iframeYoutubeEasy()).toHaveAttribute('title', 'YouTube easy')
    })
  })
```

- **Dado:** um link com `target="_blank"`.
- **Quando:** clicado, o Playwright aguarda o evento popup.
- **Então:** URL da nova página confere com example.com; iframes YouTube têm URLs de embed válidas.

---

## Como executar

```bash
npm run test:widgets
npx playwright test tests/widgets/widgets.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/WidgetsPage.ts`](../../../../pages/WidgetsPage.ts)
- Fixture de upload: [`fixtures/sample-upload.txt`](../../../../fixtures/sample-upload.txt)
