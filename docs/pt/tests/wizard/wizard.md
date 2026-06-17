# Wizard — Fluxo multi-etapas

**Arquivo fonte:** [`wizard.spec.ts`](../../../../tests/wizard/wizard.spec.ts)

---

## Objetivo

Esta suite valida a **página Wizard** — um fluxo de onboarding em três etapas com validação, navegação e revisão. Ela cobre:

- Validação e avanço na etapa 1 (informações pessoais)
- Preferências na etapa 2 (framework, role, checkbox de termos)
- Painel de revisão e estado de sucesso na etapa 3
- Navegação para trás e preservação de dados
- Reinício do wizard após conclusão
- Indicador de progresso e atributos de acessibilidade
- Navegação por teclado (Enter no Next)

Demonstra [`WizardPage`](../../../../pages/WizardPage.ts), factories de teste e `test.step` para relatórios legíveis.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Fixtures** | [`wizard.json`](../../../../fixtures/wizard.json), factories em [`support/factories/wizard.ts`](../../../../support/factories/wizard.ts) |
| **Execução** | `npm run test:wizard` |

---

## Tags utilizadas

Este spec não possui tags Playwright explícitas. Roda no projeto `wizard`. O timeout da suite é estendido para 15 segundos via `test.describe.configure({ timeout: 15_000 })`.

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | Login via API + navegação para `/web/wizard.html` |
| **Page Object** | [`WizardPage`](../../../../pages/WizardPage.ts) |
| **Factories** | `createPersonalStep`, `createPreferencesStep` — sobrescrevem defaults da fixture |
| **`test.step`** | Agrupa sub-ações no teste de fluxo completo para legibilidade no relatório HTML |
| **`check({ force: true })`** | Marca inputs radio/checkbox ocultos |
| **`test.describe.configure`** | Estende timeout para transições lentas do wizard |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { WizardPage } from '../../pages/WizardPage'
import { visitAuthenticated } from '../../support/auth'
import { createPersonalStep, createPreferencesStep } from '../../support/factories/wizard'
import wizardFixture from '../../fixtures/wizard.json'

test.describe('Wizard — multi-step flow', () => {
  test.describe.configure({ timeout: 15_000 })

  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/wizard.html')
    await expect(new WizardPage(page).pageRoot()).toBeVisible()
  })
```

- **Dado:** cada teste começa autenticado na página Wizard.
- **Quando:** `visitAuthenticated` injeta sessão e navega.
- **Então:** a raiz `page-wizard` fica visível com budget de timeout de 15s.

---

### Bloco 2 — Etapa 1 — Informações pessoais

```typescript
  test.describe('Step 1 — Personal info', () => {
    test('shows validation error when advancing with empty required fields', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.advance()
      await wizard.shouldShowStep1Error()
      await wizard.shouldShowStep1Active()
    })

    test('accepts valid personal data and advances to step 2', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
      await expect(wizard.panel(2)).toBeVisible()
      await wizard.shouldMarkStepDone(1)
    })
  })
```

- **Dado:** a etapa 1 está ativa com campos vazios.
- **Quando:** Next é clicado sem preencher campos obrigatórios.
- **Então:** erro de validação aparece e o usuário permanece na etapa 1.

- **Dado:** dados pessoais válidos da fixture.
- **Quando:** campos são preenchidos e Next é clicado.
- **Então:** o painel da etapa 2 aparece e a etapa 1 é marcada como concluída.

**Preservação de dados:**

```typescript
    test('preserves entered data when navigating back from step 2', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
      await wizard.goBack()
      await expect(wizard.nameInput()).toHaveValue(wizardFixture.personal.name)
    })
```

---

### Bloco 3 — Etapa 2 — Preferências

```typescript
  test.describe('Step 2 — Preferences', () => {
    test.beforeEach(async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
    })

    test('shows validation error when terms are not accepted', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.frameworkRadio('playwright').check({ force: true })
      await wizard.roleRadio('qa').check({ force: true })
      await wizard.advance()
      await wizard.shouldShowStep2Error()
    })
  })
```

- **Dado:** a etapa 2 está ativa (via `beforeEach` aninhado).
- **Quando:** framework/role são selecionados mas o checkbox de termos não está marcado.
- **Então:** erro de validação impede o avanço.

---

### Bloco 4 — Etapa 3 — Revisão & sucesso

```typescript
  test.describe('Step 3 — Review & success', () => {
    test('completes full wizard and shows success with review data', async ({ page }) => {
      const personal = createPersonalStep({ name: 'Senior QA Engineer' })
      const preferences = createPreferencesStep(wizardFixture.preferences)

      await test.step('Fill all wizard steps', async () => {
        const wizard = new WizardPage(page)
        await wizard.completeFullFlow(personal, preferences)
      })

      const wizard = new WizardPage(page)
      await wizard.shouldShowSuccess()
      await wizard.shouldShowReviewName(personal.name)
    })
  })
```

- **Dado:** dados pessoais e de preferência gerados por factory.
- **Quando:** o fluxo completo do wizard é concluído via helper do Page Object.
- **Então:** a tela de sucesso exibe o nome informado no painel de revisão.

---

### Bloco 5 — Navegação & reinício

```typescript
  test.describe('Navigation & restart', () => {
    test('restarts wizard after completion', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeFullFlow(createPersonalStep(), createPreferencesStep())
      await wizard.restartBtn().click()
      await wizard.shouldShowStep1Active()
      await expect(wizard.nameInput()).toHaveValue('')
    })
  })
```

- **Dado:** um wizard concluído.
- **Quando:** Restart é clicado.
- **Então:** a etapa 1 fica ativa com campos vazios.

---

### Bloco 6 — Acessibilidade

```typescript
  test.describe('Accessibility', () => {
    test('wizard panels have role group and step nav is present', async ({ page }) => {
      await expect(page.getByTestId('wizard-nav')).toBeVisible()
      await expect(page.getByTestId('wizard-panel-1')).toHaveAttribute('role', 'group')
      await expect(page.getByTestId('wizard-step-1')).toHaveAttribute('aria-current', 'step')
    })
  })
```

- **Dado:** o wizard está na etapa 1.
- **Quando:** atributos ARIA são inspecionados.
- **Então:** nav de etapas, grupos de painéis e `aria-current="step"` estão corretos.

---

## Como executar

```bash
npm run test:wizard
npx playwright test tests/wizard/wizard.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/WizardPage.ts`](../../../../pages/WizardPage.ts)
- Factories: [`support/factories/wizard.ts`](../../../../support/factories/wizard.ts)
- Fixture: [`fixtures/wizard.json`](../../../../fixtures/wizard.json)
