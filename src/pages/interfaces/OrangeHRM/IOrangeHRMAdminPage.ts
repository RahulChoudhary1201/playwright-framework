/**
 * OrangeHRM Admin Page Interface
 *
 * Defines the contract for the OrangeHRM Admin/User Management page.
 * Tests interact with this interface only - implementation is hidden.
 *
 * Abstraction benefits:
 * - Ctrl+click on any method navigates to this interface, not the POM
 * - Implementation details (locators, wait strategies) are hidden
 * - Swappable implementations (real, mock, stub) without touching tests
 * - Contract-first design: defines WHAT a page does, not HOW
 */
export interface IOrangeHRMAdminPage {
  /**
   * Navigates to the Admin module
   */
  navigate(): Promise<IOrangeHRMAdminPage>;

  /**
   * Waits for the Admin page to be fully loaded
   */
  waitForLoad(): Promise<IOrangeHRMAdminPage>;

  /**
   * Verifies the Admin/User Management page is displayed
   */
  verifyPageLoaded(): Promise<void>;

  /**
   * Verifies the User Management table is visible
   */
  verifyUserManagementTableVisible(): Promise<void>;
}