/**
 * OrangeHRM Dashboard Page Interface
 *
 * Defines the contract for the OrangeHRM dashboard page.
 * Tests interact with this interface only - implementation is hidden.
 *
 * Abstraction benefits:
 * - Ctrl+click on any method navigates to this interface, not the POM
 * - Implementation details (locators, wait strategies) are hidden
 * - Swappable implementations (real, mock, stub) without touching tests
 * - Contract-first design: defines WHAT a page does, not HOW
 */
export interface IOrangeHRMDashboardPage {
  // ==================== NAVIGATION ====================

  /**
   * Navigates to dashboard page
   */
  navigate(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Waits for dashboard to be fully loaded
   */
  waitForPageLoad(): Promise<IOrangeHRMDashboardPage>;

  // ==================== BUSINESS ACTIONS ====================

  /**
   * Logs out the current user
   */
  logout(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Navigates to Admin module
   */
  goToAdminModule(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Navigates to PIM module
   */
  goToPIMModule(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Navigates to My Info page
   */
  goToMyInfo(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Navigates to Leave module
   */
  goToLeaveModule(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Navigates to Time module
   */
  goToTimeModule(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Navigates to Dashboard from any page
   */
  goToDashboard(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Opens the user dropdown menu
   */
  openUserDropdown(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Navigates to profile page
   */
  goToProfile(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Navigates to settings page
   */
  goToSettings(): Promise<IOrangeHRMDashboardPage>;

  /**
   * Navigates to a menu item by name
   */
  navigateToMenuItem(menuItem: string): Promise<IOrangeHRMDashboardPage>;

  // ==================== ASSERTIONS ====================

  /**
   * Verifies dashboard page is displayed
   */
  verifyPageLoaded(): Promise<void>;

  /**
   * Verifies user is logged in with expected name
   */
  verifyUserLoggedIn(expectedName?: string): Promise<void>;

  /**
   * Verifies all main menu items are visible
   */
  verifyMenuItemsVisible(): Promise<void>;

  /**
   * Verifies navigation to Admin module
   */
  verifyAdminModuleLoaded(): Promise<void>;

  /**
   * Verifies navigation to PIM module
   */
  verifyPIMModuleLoaded(): Promise<void>;

  /**
   * Verifies navigation to My Info page
   */
  verifyMyInfoLoaded(): Promise<void>;

  /**
   * Verifies user is on dashboard
   */
  verifyOnDashboard(): Promise<void>;
}