# Team

**Arquivo fonte:** [`team.spec.ts`](../../../../tests/team/team.spec.ts)

---

## Objetivo

Esta suite valida a **página Team** — uma tabela rica em dados com busca, filtros, ordenação, paginação, edição inline e modal de convite de membro. Ela cobre:

- Estrutura da tabela e contagem de linhas
- Busca por nome e email
- Filtros de role e status
- Ordenação de colunas (ascendente/descendente)
- Controles de paginação
- Modal de convite com validação
- Edição inline de linha com interceptação opcional de API
- Filtro de lista de frameworks

Demonstra [`TeamPage`](../../../../pages/TeamPage.ts) e espionagem de rede com `page.waitForRequest`.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Fixture** | [`team-member.json`](../../../../fixtures/team-member.json) para dados do formulário de convite |
| **Execução** | `npm run test:team` |

---

## Tags utilizadas

Este spec não possui tags Playwright explícitas. Roda no projeto `team`.

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | Login via API + navegação direta para `/web/team.html` |
| **Page Object** | [`TeamPage`](../../../../pages/TeamPage.ts) — helpers de tabela, busca, modal e edição |
| **`page.waitForRequest`** | Captura POST/PUT/PATCH no convite e no save da edição |
| **`locator.evaluateAll`** | Lê texto das células para assertions de ordem de sort |
| **`postDataJSON()`** | Inspeciona payload da requisição interceptada |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { TeamPage } from '../../pages/TeamPage'
import { visitAuthenticated } from '../../support/auth'
import teamMember from '../../fixtures/team-member.json'

test.describe('Team', () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/team.html')
    await expect(new TeamPage(page).pageRoot()).toBeVisible()
  })
```

- **Dado:** cada teste começa autenticado na página Team.
- **Quando:** `visitAuthenticated` injeta sessão e navega.
- **Então:** a raiz `page-team` fica visível.

---

### Bloco 2 — Estrutura da página

```typescript
  test.describe('Page structure', () => {
    test('shows the page header with member count', async ({ page }) => {
      await expect(new TeamPage(page).teamSummary()).toContainText('6 members')
    })

    test('renders the correct number of rows on page 1', async ({ page }) => {
      await new TeamPage(page).shouldHaveRowCount(4)
    })
  })
```

- **Dado:** a tabela team está carregada com dados demo.
- **Quando:** header e contagem de linhas são inspecionados.
- **Então:** 6 membros no total, 4 visíveis na página 1.

---

### Bloco 3 — Busca & filtros

```typescript
  test.describe('Search', () => {
    test('filters rows by member name', async ({ page }) => {
      const team = new TeamPage(page)
      await team.search('Alice')
      await team.shouldHaveRowCount(1)
      await expect(team.nameCell(1)).toContainText('Alice QA')
    })

    test('returns all rows when search is cleared', async ({ page }) => {
      const team = new TeamPage(page)
      await team.search('Alice')
      await team.shouldHaveRowCount(1)
      await team.clearSearch()
      await team.shouldHaveRowCount(4)
    })
  })
```

- **Dado:** a tabela completa está exibida.
- **Quando:** o usuário digita na caixa de busca.
- **Então:** linhas filtram em tempo real; limpar restaura todas as linhas.

**Filtros de role e status** usam `filterByRole()` e `filterByStatus()` e verificam que cada linha visível corresponde ao atributo selecionado.

---

### Bloco 4 — Ordenação & Paginação

```typescript
  test.describe('Sorting', () => {
    test('sorts rows by name descending on first click', async ({ page }) => {
      const team = new TeamPage(page)
      await team.sortByName()
      const names = await team.tableRows().evaluateAll((rows) =>
        rows.map((row) =>
          (row.querySelector('[data-testid^="cell-name-"]')?.textContent ?? '').trim(),
        ),
      )
      expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)))
    })
  })
```

- **Dado:** ordem de sort padrão.
- **Quando:** o header da coluna name é clicado.
- **Então:** linhas reordenam em descendente; segundo clique ordena ascendente.

```typescript
  test.describe('Pagination', () => {
    test('navigates to page 2 showing remaining rows', async ({ page }) => {
      const team = new TeamPage(page)
      await team.goToNextPage()
      await expect(team.pageInfo()).toContainText('Page 2')
      await team.shouldHaveRowCount(2)
    })
  })
```

- **Dado:** página 1 com 4 linhas e "Next" habilitado.
- **Quando:** Next é clicado.
- **Então:** página 2 exibe as 2 linhas restantes.

---

### Bloco 5 — Modal de convite de membro

```typescript
  test.describe('Invite member modal', () => {
    test('shows validation error when name is empty', async ({ page }) => {
      const team = new TeamPage(page)
      await team.openInviteModal()
      await team.fillInviteForm({ email: teamMember.new.email })
      await team.submitInvite()
      await team.shouldShowInviteError('required')
    })

    test('adds a new row after successful invite', async ({ page }) => {
      const team = new TeamPage(page)
      await team.openInviteModal()
      await team.fillInviteForm(teamMember.new)
      await team.submitInvite()
      await team.shouldHaveInviteModalClosed()
      await expect(page.getByTestId('toast-message')).toContainText(teamMember.new.email)
    })
  })
```

- **Dado:** o modal de convite está aberto.
- **Quando:** o usuário submete com dados inválidos ou válidos.
- **Então:** erros de validação aparecem ou um novo membro é adicionado com toast de sucesso.

---

### Bloco 6 — Edição inline

```typescript
  test.describe('Inline editing', () => {
    test('updates the row after saving a new name', async ({ page }) => {
      const team = new TeamPage(page)
      await team.startEdit(1)
      await team.editName(1, 'Alice QA Updated')
      await team.saveEdit(1)
      await expect(team.nameCell(1)).toContainText('Alice QA Updated')
    })

    test('discards changes on Cancel', async ({ page }) => {
      const team = new TeamPage(page)
      await team.startEdit(1)
      await team.editName(1, 'Should Not Save')
      await team.cancelEdit(1)
      await expect(team.nameCell(1)).not.toContainText('Should Not Save')
    })
  })
```

- **Dado:** uma linha em modo de visualização.
- **Quando:** Edit é clicado, o nome é alterado e Save ou Cancel é pressionado.
- **Então:** a linha reflete o nome salvo ou reverte no cancel.

---

## Como executar

```bash
npm run test:team
npx playwright test tests/team/team.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/TeamPage.ts`](../../../../pages/TeamPage.ts)
- Fixture: [`fixtures/team-member.json`](../../../../fixtures/team-member.json)
- Helpers de auth: [`support/auth.ts`](../../../../support/auth.ts)
