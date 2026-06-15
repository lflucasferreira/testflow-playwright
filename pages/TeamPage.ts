import { expect, Page } from '@playwright/test'

export class TeamPage {
  constructor(private readonly page: Page) {}

  pageRoot() { return this.page.getByTestId('page-team') }
  teamSummary() { return this.page.getByTestId('team-summary') }
  inviteBtn() { return this.page.getByTestId('invite-btn') }
  searchInput() { return this.page.getByTestId('table-search') }
  roleFilter() { return this.page.getByTestId('role-filter') }
  statusFilter() { return this.page.getByTestId('status-filter') }
  sortBtn() { return this.page.getByTestId('table-sort-name') }
  rowCount() { return this.page.getByTestId('table-row-count') }
  table() { return this.page.getByTestId('users-table') }
  tableRows() { return this.table().locator('tbody tr') }
  row(id: number) { return this.page.getByTestId(`user-row-${id}`) }
  editBtn(id: number) { return this.page.getByTestId(`edit-row-${id}`) }
  saveBtn(id: number) { return this.page.getByTestId(`save-row-${id}`) }
  cancelBtn(id: number) { return this.page.getByTestId(`cancel-row-${id}`) }
  nameCell(id: number) { return this.page.getByTestId(`cell-name-${id}`) }
  roleCell(id: number) { return this.page.getByTestId(`cell-role-${id}`) }
  prevPage() { return this.page.getByTestId('prev-page') }
  nextPage() { return this.page.getByTestId('next-page') }
  pageInfo() { return this.page.getByTestId('page-info') }
  inviteModal() { return this.page.getByTestId('invite-modal') }
  inviteName() { return this.page.getByTestId('invite-name') }
  inviteEmail() { return this.page.getByTestId('invite-email') }
  inviteRole() { return this.page.getByTestId('invite-role') }
  inviteConfirm() { return this.page.getByTestId('invite-confirm') }
  inviteCancel() { return this.page.getByTestId('invite-cancel') }
  inviteError() { return this.page.getByTestId('invite-error') }
  editNameInput(id: number) { return this.page.getByTestId(`edit-name-${id}`) }
  editRoleSelect(id: number) { return this.page.getByTestId(`edit-role-${id}`) }
  frameworkSearch() { return this.page.getByTestId('item-search') }
  frameworkList() { return this.page.getByTestId('item-list') }

  async search(term: string) {
    await this.searchInput().clear()
    await this.searchInput().fill(term)
    return this
  }

  async clearSearch() {
    await this.searchInput().clear()
    return this
  }

  async filterByRole(role: string) {
    await this.roleFilter().selectOption(role)
    return this
  }

  async filterByStatus(status: string) {
    await this.statusFilter().selectOption(status)
    return this
  }

  async sortByName() {
    await this.sortBtn().click()
    return this
  }

  async goToNextPage() {
    await this.nextPage().click()
    return this
  }

  async goToPrevPage() {
    await this.prevPage().click()
    return this
  }

  async openInviteModal() {
    await this.inviteBtn().click()
    await expect(this.inviteModal()).toBeVisible()
    return this
  }

  async fillInviteForm({ name, email, role }: { name?: string; email?: string; role?: string }) {
    if (name) {
      await this.inviteName().clear()
      await this.inviteName().fill(name)
    }
    if (email) {
      await this.inviteEmail().clear()
      await this.inviteEmail().fill(email)
    }
    if (role) {
      await this.inviteRole().selectOption(role)
    }
    return this
  }

  async submitInvite() {
    await this.inviteConfirm().click()
    return this
  }

  async cancelInvite() {
    await this.inviteCancel().click()
    return this
  }

  async startEdit(id: number) {
    await this.editBtn(id).click()
    await expect(this.editNameInput(id)).toBeVisible()
    return this
  }

  async editName(id: number, newName: string) {
    await this.editNameInput(id).clear()
    await this.editNameInput(id).fill(newName)
    return this
  }

  async editRole(id: number, role: string) {
    await this.editRoleSelect(id).selectOption(role)
    return this
  }

  async saveEdit(id: number) {
    await this.saveBtn(id).click()
    return this
  }

  async cancelEdit(id: number) {
    await this.cancelBtn(id).click()
    return this
  }

  async shouldHaveRowCount(n: number) {
    await expect(this.tableRows()).toHaveCount(n)
    return this
  }

  async shouldShowRowCountLabel(text: string) {
    await expect(this.rowCount()).toContainText(text)
    return this
  }

  async shouldHaveInviteModalOpen() {
    await expect(this.inviteModal()).toBeVisible()
    return this
  }

  async shouldHaveInviteModalClosed() {
    await expect(this.inviteModal()).not.toBeVisible()
    return this
  }

  async shouldShowInviteError(text: string) {
    await expect(this.inviteError()).toBeVisible()
    await expect(this.inviteError()).toContainText(text)
    return this
  }

  async shouldShowNameInRow(id: number, name: string) {
    await expect(this.nameCell(id)).toContainText(name)
    return this
  }

  async shouldShowEditInputs(id: number) {
    await expect(this.editNameInput(id)).toBeVisible()
    await expect(this.editRoleSelect(id)).toBeVisible()
    return this
  }
}
