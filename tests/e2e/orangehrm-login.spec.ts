import { test } from '../../src/fixtures/orangeHRMTest';

/**
 * OrangeHRM Login Tests
 *
 * Tests follow AAA pattern (Arrange, Act, Assert)
 * Uses PageObjectManager (pom fixture) for centralized page object management
 * Only business actions are visible - no locators, no credentials
 * All implementation details are abstracted in Page Objects
 */
test.describe('OrangeHRM Login Tests @e2e @orangehrm', () => {
  test.describe('Login Page Display', () => {
    test('should display login page with all elements @smoke', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      await pom.orangeHRMLoginPage.verifyPageLoaded();
    });

    test('should display forgot password link @regression', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      // Verify forgot password link is visible via page object abstraction
      await pom.orangeHRMLoginPage.verifyForgotPasswordLinkVisible();
    });
  });

  test.describe('Successful Login', () => {
    test('should login successfully with admin credentials @smoke', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      await pom.orangeHRMLoginPage.loginAsAdmin();
      await pom.orangeHRMDashboardPage.waitForPageLoad();
      await pom.orangeHRMDashboardPage.verifyPageLoaded();
    });

    test('should redirect to dashboard after successful login @regression', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      await pom.orangeHRMLoginPage.loginAsAdmin();
      await pom.orangeHRMLoginPage.verifyLoginSuccessful();
    });

    test('should display logged-in user name @regression', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      await pom.orangeHRMLoginPage.loginAsAdmin();
      await pom.orangeHRMDashboardPage.waitForPageLoad();
      await pom.orangeHRMDashboardPage.verifyUserLoggedIn();
    });
  });

  test.describe('Failed Login', () => {
    test('should show error for invalid credentials @negative', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      await pom.orangeHRMLoginPage.loginWithInvalidCredentials();
      await pom.orangeHRMLoginPage.verifyInvalidCredentialsError();
    });

    test('should show validation error for empty username @negative', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      await pom.orangeHRMLoginPage.loginWithEmptyUsername();
      await pom.orangeHRMLoginPage.verifyRequiredFieldError('Username');
    });

    test('should show validation error for empty password @negative', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      await pom.orangeHRMLoginPage.loginWithEmptyPassword();
      await pom.orangeHRMLoginPage.verifyRequiredFieldError('Password');
    });

    test('should show validation errors for both empty fields @negative', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      await pom.orangeHRMLoginPage.loginWithEmptyCredentials();
      await pom.orangeHRMLoginPage.verifyRequiredFieldError('Username');
      await pom.orangeHRMLoginPage.verifyRequiredFieldError('Password');
    });
  });

  test.describe('Forgot Password', () => {
    test('should navigate to forgot password page @regression', async ({ pom }) => {
      await pom.orangeHRMLoginPage.navigate();
      await pom.orangeHRMLoginPage.goToForgotPassword();
      await pom.orangeHRMLoginPage.verifyForgotPasswordPage();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully @smoke', async ({ pom, authenticatedPage }) => {
      void authenticatedPage; // fixture side effect: ensures user is logged in
      await pom.orangeHRMDashboardPage.logout();
      await pom.orangeHRMLoginPage.verifyPageLoaded();
    });
  });
});
