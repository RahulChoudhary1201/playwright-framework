import { Page, Locator, expect } from '@playwright/test';
import { IOrangeHRMDashboardPage } from '../../interfaces/OrangeHRM/IOrangeHRMDashboardPage';

/**
 * OrangeHRM Dashboard Page Object
 *
 * Implements abstraction by:
 * - Hiding all locators as private members
 * - Exposing only business-relevant actions and verifications
 * - Using semantic method names that describe business intent
 * - Delegating to internal private methods (single source of truth)
 * - Implementing IOrangeHRMDashboardPage interface for contract-first design
 */
export class OrangeHRMDashboardPage implements IOrangeHRMDashboardPage {
  private readonly page: Page;

  // Private locators - implementation details hidden from tests
  private readonly dashboardHeader: Locator;
  private readonly userDropdown: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize all locators internally
    this.dashboardHeader = page.locator('.oxd-text--h6').filter({ hasText: 'Dashboard' });
    this.userDropdown = page.locator('.oxd-userdropdown-name');
    this.logoutLink = page.getByRole('menuitem', { name: 'Logout' });
  }

  /**
   * Navigates to dashboard page
   * @returns this (for method chaining)
   */
  async navigate(): Promise<this> {
    await this.page.goto('/web/index.php/dashboard', {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    });
    await this.waitForPageLoad();
    return this;
  }

  /**
   * Waits for dashboard to be fully loaded
   * @returns this (for method chaining)
   */
  async waitForPageLoad(): Promise<this> {
    await this.dashboardHeader.waitFor({ state: 'visible' });
    return this;
  }

  // ==================== BUSINESS ACTIONS ====================

  /**
   * Logs out the current user
   * @returns this (for method chaining)
   */
  async logout(): Promise<this> {
    await this.openUserDropdown();
    await this.logoutLink.click();
    return this;
  }

  /**
   * Navigates to Admin module
   * @returns this (for method chaining)
   */
  async goToAdminModule(): Promise<this> {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    return this;
  }

  /**
   * Navigates to PIM module
   * @returns this (for method chaining)
   */
  async goToPIMModule(): Promise<this> {
    await this.page.getByRole('link', { name: 'PIM' }).click();
    return this;
  }

  /**
   * Navigates to My Info page
   * @returns this (for method chaining)
   */
  async goToMyInfo(): Promise<this> {
    await this.page.getByRole('link', { name: 'My Info' }).click();
    return this;
  }

  /**
   * Navigates to Leave module
   * @returns this (for method chaining)
   */
  async goToLeaveModule(): Promise<this> {
    await this.page.getByRole('link', { name: 'Leave' }).click();
    return this;
  }

  /**
   * Navigates to Time module
   * @returns this (for method chaining)
   */
  async goToTimeModule(): Promise<this> {
    await this.page.getByRole('link', { name: 'Time' }).click();
    return this;
  }

  /**
   * Navigates to Dashboard from any page
   * @returns this (for method chaining)
   */
  async goToDashboard(): Promise<this> {
    await this.page.getByRole('link', { name: 'Dashboard' }).click();
    return this;
  }

  /**
   * Opens the user dropdown menu
   * @returns this (for method chaining)
   */
  async openUserDropdown(): Promise<this> {
    await this.userDropdown.click();
    return this;
  }

  /**
   * Navigates to profile page
   * @returns this (for method chaining)
   */
  async goToProfile(): Promise<this> {
    await this.openUserDropdown();
    await this.page.getByRole('link', { name: 'My Info' }).click();
    return this;
  }

  /**
   * Navigates to settings page
   * @returns this (for method chaining)
   */
  async goToSettings(): Promise<this> {
    await this.openUserDropdown();
    await this.page.getByRole('link', { name: 'Settings' }).click();
    return this;
  }

  /**
   * Navigates to a menu item by name
   * @param menuItem - Name of the menu item
   * @returns this (for method chaining)
   */
  async navigateToMenuItem(menuItem: string): Promise<this> {
    await this.page.getByRole('link', { name: menuItem }).click();
    return this;
  }

  // ==================== ASSERTIONS ====================

  /**
   * Verifies dashboard page is displayed
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.dashboardHeader).toBeVisible();
  }

  /**
   * Verifies user is logged in with expected name
   * @param expectedName - Expected user name (optional, checks any name if not provided)
   */
  async verifyUserLoggedIn(expectedName?: string): Promise<void> {
    await expect(this.userDropdown).toBeVisible();
    if (expectedName) {
      await expect(this.userDropdown).toContainText(expectedName);
    }
  }

  /**
   * Verifies all main menu items are visible
   */
  async verifyMenuItemsVisible(): Promise<void> {
    const menuItems = ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance', 'Dashboard'];

    for (const item of menuItems) {
      await expect(this.page.getByRole('link', { name: item })).toBeVisible();
    }
  }

  /**
   * Verifies navigation to Admin module
   */
  async verifyAdminModuleLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*admin.*/i);
    await expect(this.page.locator('.oxd-text--h6').filter({ hasText: 'User Management' })).toBeVisible();
  }

  /**
   * Verifies navigation to PIM module
   */
  async verifyPIMModuleLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*pim.*/i);
  }

  /**
   * Verifies navigation to My Info page
   */
  async verifyMyInfoLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*viewPersonalDetails.*/i);
  }

  /**
   * Verifies user is on dashboard
   */
  async verifyOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/.*dashboard.*/i);
  }
}