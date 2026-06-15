import { expect, Page } from '@playwright/test'

export class AdvancedPage {
  constructor(private readonly page: Page) {}

  pageRoot() { return this.page.getByTestId('page-advanced') }
  sectionShadow() { return this.page.getByTestId('section-shadow') }
  shadowHost() { return this.page.getByTestId('shadow-host') }
  demoIframe() { return this.page.getByTestId('demo-iframe') }
  externalLink() { return this.page.getByTestId('external-link') }
  iframeResult() { return this.page.getByTestId('iframe-result') }
  finishBtn() { return this.page.getByTestId('page-finish-btn') }
  backBtn() { return this.page.getByTestId('page-back-btn') }

  async shadowContentCount(): Promise<number> {
    return this.shadowHost().evaluate((host) => {
      const root = (host as HTMLElement & { shadowRoot: ShadowRoot | null }).shadowRoot
      return root ? root.querySelectorAll('*').length : 0
    })
  }

  async shouldShowShadowSection() {
    await expect(this.sectionShadow()).toBeVisible()
    await expect(this.shadowHost()).toBeVisible()
    return this
  }

  async shouldHaveIframeSrc() {
    await expect(this.demoIframe()).toBeVisible()
    await expect(this.demoIframe()).toHaveAttribute('src', /./)
    return this
  }

  async shouldHaveExternalLink() {
    await expect(this.externalLink()).toHaveAttribute('href', /^https?:\/\//)
    await expect(this.externalLink()).toHaveAttribute('target', '_blank')
    return this
  }

  iframeFrame() {
    return this.page.frameLocator('[data-testid="demo-iframe"]')
  }

  async shouldShowIframeContent() {
    const frame = this.iframeFrame()
    await expect(frame.locator('body')).toBeVisible({ timeout: 10_000 })
    return this
  }
}
