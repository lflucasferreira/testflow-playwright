import { test, expect } from '@playwright/test'
import { ComponentsPage } from '../../pages/ComponentsPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Components', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/components.html')
    await new ComponentsPage(page).shouldShowPage()
  })

  test.describe('Buttons', () => {
    test('all button variants are visible', async ({ page }) => {
      const components = new ComponentsPage(page)
      for (const id of ['btn-primary', 'btn-secondary', 'btn-success', 'btn-danger']) {
        const btn = components.button(id)
        await expect(btn).toBeVisible()
        await expect(btn).toBeEnabled()
      }
    })

    test('disabled button is not interactive', async ({ page }) => {
      const btn = new ComponentsPage(page).button('btn-disabled')
      await expect(btn).toBeDisabled()
      await expect(btn).toHaveCSS('cursor', 'not-allowed')
    })

    test('loading button shows spinner during simulated load', async ({ page }) => {
      await new ComponentsPage(page).button('btn-loading').click()
      await expect(page.getByTestId('btn-loading')).toBeDisabled()
      await expect(page.locator('.spinner')).toBeVisible()
      await expect(page.getByTestId('btn-loading')).toBeEnabled({ timeout: 5000 })
    })

    test('toast button shows a toast notification', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.button('btn-toast').click()
      await expect(components.toastMessage()).toBeVisible()
      await expect(components.toastMessage()).not.toBeEmpty()
    })

    test('native alert can be dismissed', async ({ page }) => {
      page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBeTruthy()
        await dialog.accept()
      })
      await new ComponentsPage(page).button('btn-alert').click()
    })

    test('native confirm returns true on accept', async ({ page }) => {
      page.once('dialog', (dialog) => dialog.accept())
      await new ComponentsPage(page).button('btn-confirm').click()
      await expect(new ComponentsPage(page).dialogResult()).toContainText('Confirmed')
    })

    test('native confirm returns false on cancel', async ({ page }) => {
      page.once('dialog', (dialog) => dialog.dismiss())
      await new ComponentsPage(page).button('btn-confirm').click()
      await expect(new ComponentsPage(page).dialogResult()).toContainText('Cancelled')
    })
  })

  test.describe('Modal', () => {
    test.beforeEach(async ({ page }) => {
      await new ComponentsPage(page).openModal()
    })

    test('opens modal and shows title', async ({ page }) => {
      await expect(page.locator('#modal-title')).toContainText('Confirm action')
    })

    test('has accessible role dialog', async ({ page }) => {
      const modal = new ComponentsPage(page).modalOverlay()
      await expect(modal).toHaveAttribute('role', 'dialog')
      await expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    test('closes on Confirm button', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.modalConfirmBtn().click()
      await expect(components.modalOverlay()).not.toBeVisible()
      await expect(components.toastMessage()).toBeVisible()
    })

    test('closes on Cancel button', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.modalCancelBtn().click()
      await expect(components.modalOverlay()).not.toBeVisible()
    })

    test('closes on close (✕) button', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.modalCloseBtn().click()
      await expect(components.modalOverlay()).not.toBeVisible()
    })

    test('closes on Escape key', async ({ page }) => {
      await page.keyboard.press('Escape')
      await expect(new ComponentsPage(page).modalOverlay()).not.toBeVisible()
    })

    test('closes on overlay background click', async ({ page }) => {
      await new ComponentsPage(page).modalOverlay().click({ position: { x: 10, y: 10 }, force: true })
      await expect(new ComponentsPage(page).modalOverlay()).not.toBeVisible()
    })

    test('aria-hidden is set correctly when closed', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.modalCancelBtn().click()
      await expect(components.modalOverlay()).toHaveAttribute('aria-hidden', 'true')
    })
  })

  test.describe('Tabs', () => {
    test('Overview tab is active by default', async ({ page }) => {
      const components = new ComponentsPage(page)
      await expect(components.tabOverview()).toHaveAttribute('aria-selected', 'true')
      await expect(components.tabPanelOverview()).toBeVisible()
    })

    test('clicking Cypress tab activates it and shows its panel', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.tabCypress().click()
      await expect(components.tabCypress()).toHaveAttribute('aria-selected', 'true')
      await expect(components.tabPanelCypress()).toBeVisible()
      await expect(components.tabPanelOverview()).not.toBeVisible()
    })

    test('clicking Playwright tab activates it and shows its panel', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.tabPlaywright().click()
      await expect(components.tabPlaywright()).toHaveAttribute('aria-selected', 'true')
      await expect(components.tabPanelPlaywright()).toBeVisible()
    })

    test('only one tab panel is visible at a time', async ({ page }) => {
      await new ComponentsPage(page).tabCypress().click()
      await expect(page.locator('.tab-panel.active')).toHaveCount(1)
    })

    test('tabs have correct role attributes', async ({ page }) => {
      await expect(page.locator('[role="tablist"]')).toBeVisible()
      await expect(page.locator('[role="tab"]')).toHaveCount(3)
      await expect(page.locator('[role="tabpanel"]')).toHaveCount(3)
    })
  })

  test.describe('Accordion', () => {
    test('all panels are collapsed by default', async ({ page }) => {
      const components = new ComponentsPage(page)
      for (const n of [1, 2, 3]) {
        await expect(components.accordionTrigger(n)).toHaveAttribute('aria-expanded', 'false')
        await expect(components.accordionPanel(n)).not.toBeVisible()
      }
    })

    test('expands first panel on click', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.accordionTrigger(1).click()
      await expect(components.accordionTrigger(1)).toHaveAttribute('aria-expanded', 'true')
      await expect(components.accordionPanel(1)).toBeVisible()
    })

    test('collapses first panel on second click', async ({ page }) => {
      const trigger = new ComponentsPage(page).accordionTrigger(1)
      await trigger.click()
      await trigger.click()
      await expect(new ComponentsPage(page).accordionPanel(1)).not.toBeVisible()
    })

    test('multiple panels can be open simultaneously', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.accordionTrigger(1).click()
      await components.accordionTrigger(2).click()
      await expect(components.accordionPanel(1)).toBeVisible()
      await expect(components.accordionPanel(2)).toBeVisible()
    })
  })
})
