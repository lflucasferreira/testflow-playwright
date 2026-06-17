# UI States — Loading, Empty, Error & Partial

**Arquivo fonte:** [`states.spec.ts`](../../../../tests/states/states.spec.ts)

---

## Objetivo

Esta suite valida a **página UI States** — padrões de UI assíncrona incluindo skeleton loading, empty states, transições de erro/sucesso e carregamento parcial de grid. Ela cobre:

- Carregamento e reset de skeleton cards
- Empty state quando a busca não tem matches
- Disparo de erro e recuperação de sucesso
- Carregamento e reset de grid parcial
- Visibilidade de seções

Demonstra [`StatesPage`](../../../../pages/StatesPage.ts) para assertions de UI orientada a estado.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Execução** | `npm run test:states` |

---

## Tags utilizadas

Este spec não possui tags Playwright explícitas. O timeout da suite é estendido para 12 segundos via `test.describe.configure({ timeout: 12_000 })`.

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | Login via API + navegação para `/web/states.html` |
| **Page Object** | [`StatesPage`](../../../../pages/StatesPage.ts) — helpers de trigger e assertion |
| **`not.toBeVisible()`** | Confirma estados vazios/ocultos |
| **`not.toContainText(/500|fail/i)`** | Verifica que mensagem de erro foi substituída após sucesso |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { StatesPage } from '../../pages/StatesPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('UI States — loading, empty, error & partial', () => {
  test.describe.configure({ timeout: 12_000 })

  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/states.html')
    await expect(new StatesPage(page).pageRoot()).toBeVisible()
  })
```

- **Dado:** cada teste começa autenticado na página UI States.
- **Quando:** `visitAuthenticated` injeta sessão e navega.
- **Então:** a raiz `page-states` fica visível.

---

### Bloco 2 — Skeleton loading

```typescript
  test.describe('Skeleton loading', () => {
    test('shows skeleton cards on trigger', async ({ page }) => {
      const states = new StatesPage(page)
      await states.loadSkeletonCards()
      await states.shouldShowSkeletonLoading()
    })

    test('resets skeleton to idle state', async ({ page }) => {
      const states = new StatesPage(page)
      await states.loadSkeletonCards()
      await states.resetSkeleton()
      await expect(states.skeletonIdle()).toBeVisible()
    })
  })
```

- **Dado:** seção skeleton em estado idle.
- **Quando:** Load é disparado.
- **Então:** placeholders skeleton aparecem; Reset retorna ao idle.

---

### Bloco 3 — Empty state

```typescript
  test.describe('Empty state', () => {
    test('shows empty state when search has no matches', async ({ page }) => {
      const states = new StatesPage(page)
      await states.searchEmpty('xyz')
      await states.shouldShowEmptyState()
    })

    test('clears empty state when search is reset', async ({ page }) => {
      const states = new StatesPage(page)
      await states.searchEmpty('xyz')
      await states.shouldShowEmptyState()
      await states.emptySearch().clear()
      await expect(states.emptyState()).not.toBeVisible()
    })
  })
```

- **Dado:** uma lista pesquisável com itens demo.
- **Quando:** um termo sem matches é digitado.
- **Então:** ilustração/mensagem de empty state aparece; limpar a busca oculta o estado.

---

### Bloco 4 — Error & success assíncronos

```typescript
  test.describe('Error & success async', () => {
    test('error trigger shows error container with message', async ({ page }) => {
      const states = new StatesPage(page)
      await states.triggerErrorFetch()
      await states.shouldShowErrorState()
    })

    test('success trigger replaces error with success content', async ({ page }) => {
      const states = new StatesPage(page)
      await states.triggerErrorFetch()
      await states.triggerSuccessFetch()
      await expect(states.errorContainer()).not.toBeEmpty()
      await expect(states.errorContainer()).not.toContainText(/500|fail/i)
    })
  })
```

- **Dado:** triggers de fetch assíncrono para erro e sucesso.
- **Quando:** erro é disparado e depois sucesso.
- **Então:** container exibe conteúdo de sucesso sem keywords de erro.

---

### Bloco 5 — Partial loading & seções

```typescript
  test.describe('Partial loading', () => {
    test('loads partial grid on trigger', async ({ page }) => {
      const states = new StatesPage(page)
      await states.loadPartialGrid()
      await states.shouldShowPartialGrid()
    })
  })

  test.describe('Section visibility', () => {
    test('all UI state sections are present', async ({ page }) => {
      for (const id of ['section-skeleton', 'section-empty', 'section-error', 'section-partial']) {
        await expect(page.getByTestId(id)).toBeVisible()
      }
    })
  })
```

- **Dado:** seção de grid parcial em estado oculto inicial.
- **Quando:** Load partial é disparado.
- **Então:** células do grid aparecem; as quatro seções de estado ficam visíveis no carregamento da página.

---

## Como executar

```bash
npm run test:states
npx playwright test tests/states/states.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/StatesPage.ts`](../../../../pages/StatesPage.ts)
- Suite A11y inclui scan de UI States: [`tests/a11y/a11y.spec.ts`](../../../../tests/a11y/a11y.spec.ts)
