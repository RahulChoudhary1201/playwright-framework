/**
 * OrangeHRM Login Page Interface
 *
 * Defines the contract for the OrangeHRM login page.
 * Tests interact with this interface only - implementation is hidden.
 *
 * Abstraction benefits:
 * - Ctrl+click on any method navigates to this interface, not the POM
 * - Implementation details (locators, wait strategies) are hidden
 * - Swappable implementations (real, mock, stub) without touching tests
 * - Contract-first design: defines WHAT a page does, not HOW
 */
export interface IOrangeHRMLoginPage {
  // ==================== NAVIGATION ====================

  /**
   * Navigates to OrangeHRM login page
   */
  navigate(): Promise<IOrangeHRMLoginPage>;

  /**
   * Waits for login page to be fully loaded
   */
  waitForLoad(): Promise<IOrangeHRMLoginPage>;

  // ==================== BUSINESS ACTIONS ====================

  /**
   * Performs login with default admin credentials
   */
  loginAsAdmin(): Promise<IOrangeHRMLoginPage>;

  /**
   * Performs login with specified credentials
   */
  login(username: string, password: string): Promise<IOrangeHRMLoginPage>;

  /**
   * Performs login with invalid credentials (for negative testing)
   */
  loginWithInvalidCredentials(): Promise<IOrangeHRMLoginPage>;

  /**
   * Performs login with empty credentials (for validation testing)
   */
  loginWithEmptyCredentials(): Promise<IOrangeHRMLoginPage>;

  /**
   * Performs login with empty username only
   */
  loginWithEmptyUsername(): Promise<IOrangeHRMLoginPage>;

  /**
   * Performs login with empty password only
   */
  loginWithEmptyPassword(): Promise<IOrangeHRMLoginPage>;

  /**
   * Navigates to forgot password page
   */
  goToForgotPassword(): Promise<IOrangeHRMLoginPage>;

  // ==================== ASSERTIONS ====================

  /**
   * Verifies login page is displayed correctly
   */
  verifyPageLoaded(): Promise<void>;

  /**
   * Verifies forgot password link is visible
   */
  verifyForgotPasswordLinkVisible(): Promise<void>;

  /**
   * Verifies login was successful by checking URL
   */
  verifyLoginSuccessful(): Promise<void>;

  /**
   * Verifies error message is displayed
   */
  verifyErrorMessage(expectedMessage: string): Promise<void>;

  /**
   * Verifies invalid credentials error is shown
   */
  verifyInvalidCredentialsError(): Promise<void>;

  /**
   * Verifies required field validation error
   */
  verifyRequiredFieldError(fieldName: string): Promise<void>;

  /**
   * Verifies forgot password page is displayed
   */
  verifyForgotPasswordPage(): Promise<void>;

  // ==================== COMPATIBILITY METHODS ====================

  /**
   * Fills login form without submitting (for negative testing)
   */
  fillLoginForm(email: string, password: string): Promise<IOrangeHRMLoginPage>;

  /**
   * Clicks login button
   */
  clickLoginButton(): Promise<IOrangeHRMLoginPage>;

  /**
   * Checks if login button is enabled
   */
  isLoginButtonEnabled(): Promise<boolean>;

  /**
   * Asserts error message is displayed with expected text
   */
  assertErrorMessage(expectedMessage: string): Promise<void>;

  /**
   * Asserts email validation error
   */
  assertEmailValidationError(expectedError: string): Promise<void>;

  /**
   * Asserts login page is displayed
   */
  assertPageDisplayed(): Promise<void>;
}