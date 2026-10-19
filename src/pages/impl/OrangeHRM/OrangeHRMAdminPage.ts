import { Page, Locator, expect } from '@playwright/test';
import { IOrangeHRMAdminPage } from '../../interfaces/OrangeHRM/IOrangeHRMAdminPage';

/**
 * OrangeHRM Admin Page Object
 *
 * Implements abstraction by:
 * - Hiding all locators as private members
 * - Exposing only business-relevant actions and verifications
 * - Using semantic method names that describe business intent
 * - Delegating to internal private methods (single source of truth)
 * - Implementing IOrangeHRMAdminPage interface for contract-first design
 */
export class OrangeHRMAdminPage implements IOrangeHRMAdminPage {
  private readonly page: Page;

  // Private locators - implementation details hidden from tests
  private readonly pageHeader: Locator;
  private readonly userManagementTable: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize all locators internally
    this.pageHeader = page.locator('.oxd-text--h6').filter({ hasText: 'User Management' });
    this.userManagementTable = page.locator('.oxd-table');
  }

  /**
   * Navigates to the OrangeHRM Admin module
   * @returns this (for method chaining)
   */
  async navigate(): Promise<this> {
    await this.page.goto('/index.php/admin', {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    });
    await this.waitForPageLoad();
    return this;
  }

  /**
   * Waits for the Admin page to be fully loaded
   * @returns this (for method chaining)
   */
  private async waitForPageLoad(): Promise<this> {
    await this.pageHeader.waitFor({ state: 'visible' });
    return this;
  }

  /**
   * Waits for the Admin page to be fully loaded (interface contract)
   * @returns this (for method chaining)
   */
  async waitForLoad(): Promise<this> {
    return this.waitForPageLoad();
  }

  /**
   * Verifies the Admin/User Management page is displayed
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*admin.*/i);
    await expect(this.pageHeader).toBeVisible();
  }

  /**
   * Verifies the User Management table is visible
   */
  async verifyUserManagementTableVisible(): Promise<void> {
    await expect(this.userManagementTable).toBeVisible();
  }
}