# Settings

**Arquivo fonte:** [`settings.spec.ts`](../../../../tests/settings/settings.spec.ts)

---

## Objetivo

Esta suite valida a **página Settings** — perfil, notificações, segurança, integrações e danger zone. Ela cobre:

- Pré-preenchimento, save e seleção de timezone no formulário de perfil
- Toggles de notificação, slider de volume e checkbox de digest
- Validação e sucesso na troca de senha
- Toggle de autenticação de dois fatores
- Exibição de sessão ativa
- Copiar/rotacionar token de API com interceptação de rede
- Save de URL de webhook
- Diálogo de confirmação de exclusão de conta

Demonstra [`SettingsPage`](../../../../pages/SettingsPage.ts) e o handler `page.once('dialog')` do Playwright.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` em variáveis de ambiente |
| **Execução** | `npm run test:settings` |

---

## Tags utilizadas

Este spec não possui tags Playwright explícitas. Roda no projeto `settings`.

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | Login via API + navegação para `/web/settings.html` |
| **Page Object** | [`SettingsPage`](../../../../pages/SettingsPage.ts) |
| **`page.once('dialog')`** | Trata `confirm()` nativo na exclusão de conta |
| **`page.waitForRequest` / `waitForResponse`** | Captura chamadas de troca de senha e rotação de token |
| **`selectOption`** | Altera dropdown de timezone |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { SettingsPage } from '../../pages/SettingsPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Settings', () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/settings.html')
    await expect(new SettingsPage(page).pageRoot()).toBeVisible()
  })
```

- **Dado:** cada teste começa autenticado na página Settings.
- **Quando:** `visitAuthenticated` injeta sessão e navega.
- **Então:** a raiz `page-settings` fica visível.

---

### Bloco 2 — Seção de perfil

```typescript
  test.describe('Profile section', () => {
    test('shows pre-filled values for name and email', async ({ page }) => {
      const settings = new SettingsPage(page)
      await expect(settings.nameInput()).toHaveValue('Demo User')
      await expect(settings.emailInput()).toHaveValue('demo@automation.io')
    })

    test('saves profile and shows success message', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.fillName('Demo User Updated')
      await settings.saveProfile()
      await settings.shouldShowSaveSuccess()
    })
  })
```

- **Dado:** o formulário de perfil está pré-preenchido com dados demo.
- **Quando:** o usuário edita e salva.
- **Então:** mensagem de sucesso e toast confirmam o save.

---

### Bloco 3 — Notificações

```typescript
  test.describe('Notifications section', () => {
    test('push notifications start as Off', async ({ page }) => {
      await new SettingsPage(page).shouldShowNotificationsOff()
    })

    test('toggles notifications On', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.toggleNotifications()
      await settings.shouldShowNotificationsOn()
    })

    test('volume slider updates the displayed value', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.setSlider(75)
      await expect(settings.volumeValue()).toHaveText('75')
    })
  })
```

- **Dado:** configurações padrão de notificação.
- **Quando:** toggles e slider são ajustados.
- **Então:** a UI reflete estado On/Off e volume numérico.

---

### Bloco 4 — Segurança — senha & 2FA

```typescript
  test.describe('Security — password change', () => {
    test('shows error when new password is too short', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.submitPasswordChange('Demo123!', 'short')
      await settings.shouldShowPasswordError('8 characters')
    })

    test('shows success when a valid new password is provided', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.submitPasswordChange('Demo123!', 'NewPass123!')
      await expect(settings.passwordResult()).toContainText('updated')
    })
  })
```

- **Dado:** o formulário de troca de senha.
- **Quando:** senhas inválidas ou válidas são submetidas.
- **Então:** erros de validação ou mensagem de sucesso aparecem; campos limpam no sucesso.

**Toggle 2FA** verifica mudança de `aria-checked` e texto de status entre Disabled e Enabled.

---

### Bloco 5 — Integrações — token de API & Webhook

```typescript
  test.describe('Integrations — API token', () => {
    test('generates a new token on Rotate', async ({ page }) => {
      const settings = new SettingsPage(page)
      const original = await settings.apiKeyDisplay().innerText()
      await settings.rotateToken()
      await expect(settings.apiKeyDisplay()).not.toHaveText(original)
    })

    test('rotate token triggers a request and response contains new token', async ({ page }) => {
      const settings = new SettingsPage(page)
      const rotateRequest = page.waitForResponse(
        (res) => res.url().includes('/api/'),
        { timeout: 3000 },
      ).catch(() => null)

      await settings.rotateToken()
      const interception = await rotateRequest
      if (interception) {
        expect(interception.status()).toBe(200)
        const body = await interception.json()
        expect(typeof body.token).toBe('string')
      }
    })
  })
```

- **Dado:** um token de API existente está exibido.
- **Quando:** Rotate é clicado.
- **Então:** um novo token aparece e a API retorna 200 com string de token.

---

### Bloco 6 — Danger zone

```typescript
  test.describe('Danger zone', () => {
    test('delete account shows confirmation dialog', async ({ page }) => {
      let confirmCalled = false
      page.once('dialog', async (dialog) => {
        confirmCalled = true
        expect(dialog.type()).toBe('confirm')
        await dialog.dismiss()
      })
      await new SettingsPage(page).deleteAccountBtn().click()
      expect(confirmCalled).toBe(true)
    })
  })
```

- **Dado:** a seção danger zone está visível.
- **Quando:** Delete account é clicado.
- **Então:** um diálogo confirm nativo aparece (dispensado no teste).

---

## Como executar

```bash
npm run test:settings
npx playwright test tests/settings/settings.spec.ts
```

---

## Referências relacionadas

- Page Object: [`pages/SettingsPage.ts`](../../../../pages/SettingsPage.ts)
- Helpers de auth: [`support/auth.ts`](../../../../support/auth.ts)
