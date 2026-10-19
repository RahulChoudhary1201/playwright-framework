import { test, expect } from '../../src/fixtures/orangeHRMTest';

/**
 * OrangeHRM Dashboard Tests
 *
 * Tests follow AAA pattern (Arrange, Act, Assert)
 * Uses PageObjectManager (pom fixture) for centralized page object management
 * Only business actions are visible - no locators, no implementation details
 * All complexity is abstracted in Page Objects
 */
test.describe('OrangeHRM Dashboard Tests @e2e @orangehrm', () => {
  test.describe('Dashboard Display', () => {
    test('should display dashboard after login @smoke', async ({ pom, authenticatedPage }) => {
      void authenticatedPage; // fixture side effect: ensures user is logged in
      await pom.orangeHRMDashboardPage.verifyPageLoaded();
      await pom.orangeHRMDashboardPage.verifyOnDashboard();
    });

    test('should display user profile name @regression', async ({ pom, authenticatedPage }) => {
      void authenticatedPage; // fixture side effect: ensures user is logged in
      await pom.orangeHRMDashboardPage.verifyUserLoggedIn();
    });

    test('should display sidebar menu items @smoke', async ({ pom, authenticatedPage }) => {
      void authenticatedPage; // fixture side effect: ensures user is logged in
      await pom.orangeHRMDashboardPage.verifyMenuItemsVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to Admin module @regression', async ({ pom, authenticatedPage }) => {
      void authenticatedPage; // fixture side effect: ensures user is logged in
      await pom.orangeHRMDashboardPage.goToAdminModule();
      await pom.orangeHRMDashboardPage.verifyAdminModuleLoaded();
    });

    test('should navigate to PIM module @regression', async ({ pom, authenticatedPage }) => {
      void authenticatedPage; // fixture side effect: ensures user is logged in
      await pom.orangeHRMDashboardPage.goToPIMModule();
      await pom.orangeHRMDashboardPage.verifyPIMModuleLoaded();
    });

    test('should navigate to My Info page @regression', async ({ pom, authenticatedPage }) => {
      void authenticatedPage; // fixture side effect: ensures user is logged in
      await pom.orangeHRMDashboardPage.goToMyInfo();
      await pom.orangeHRMDashboardPage.verifyMyInfoLoaded();
    });

    test('should navigate back to Dashboard @regression', async ({ pom, authenticatedPage }) => {
      void authenticatedPage; // fixture side effect: ensures user is logged in
      // Navigate away first
      await pom.orangeHRMDashboardPage.goToAdminModule();
      await pom.orangeHRMDashboardPage.verifyAdminModuleLoaded();

      // Navigate back to Dashboard
      await pom.orangeHRMDashboardPage.goToDashboard();
      await pom.orangeHRMDashboardPage.verifyOnDashboard();
    });
  });

  test.describe('User Dropdown', () => {
    test('should have logout option available @regression', async ({ pom, authenticatedPage }) => {
      void authenticatedPage; // fixture side effect: ensures user is logged in
      // Verify user can logout (logout option exists)
      await pom.orangeHRMDashboardPage.logout();
      await expect(pom.page).toHaveURL(/.*login.*/i);
    });
  });
});