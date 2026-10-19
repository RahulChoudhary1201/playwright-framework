import { Page, Locator, expect } from '@playwright/test';
import { TestDataProvider } from '../../../utils/TestDataProvider';
import { IOrangeHRMLoginPage } from '../../interfaces/OrangeHRM/IOrangeHRMLoginPage';

/**
 * OrangeHRM Login Page Object
 *
 * Implements abstraction by:
 * - Hiding all locators as private members
 * - Exposing only business-relevant actions
 * - Abstracting credential management via TestDataProvider
 * - Returning 'this' for method chaining
 * - Implementing IOrangeHRMLoginPage interface for contract-first design
 */
export class OrangeHRMLoginPage implements IOrangeHRMLoginPage {
  private readonly page: Page;

  // Private locators - implementation details hidden from tests
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly errorMessage: Locator;
  private readonly loginTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize all locators internally
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.getByText('Forgot your password?');
    this.errorMessage = page.locator('.oxd-alert-content-text');
    this.loginTitle = page.locator('.orangehrm-login-title');
  }

  /**
   * Navigates to OrangeHRM login page
   * @returns this (for method chaining)
   */
  async navigate(): Promise<this> {
    await this.page.goto('/web/index.php/auth/login', {
      timeout: 60000,
      waitUntil: 'domcontentloaded'
    });
    await this.waitForPageLoad();
    return this;
  }

  /**
   * Waits for page to be fully loaded
   * @returns this (for method chaining)
   */
  private async waitForPageLoad(): Promise<this> {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.loginButton.waitFor({ state: 'visible' });
    return this;
  }

  // ==================== BUSINESS ACTIONS ====================

  /**
   * Performs login with default admin credentials
   * Abstracts credential retrieval from test
   * @returns this (for method chaining)
   */
  async loginAsAdmin(): Promise<this> {
    const credentials = TestDataProvider.getAdminCredentials();
    return this.performLogin(credentials.username, credentials.password);
  }

  /**
   * Performs login with specified credentials
   * Abstraction: hides credential details and implementation
   * @param username - Username to login with
   * @param password - Password to login with
   * @returns this (for method chaining)
   */
  async login(username: string, password: string): Promise<this> {
    return this.performLogin(username, password);
  }

  /**
   * Waits for login page to be fully loaded
   * @returns this (for method chaining)
   */
  async waitForLoad(): Promise<this> {
    return this.waitForPageLoad();
  }

  /**
   * Verifies login page is displayed
   * Abstraction: hides implementation details
   */
  assertPageDisplayed(): Promise<void> {
    return this.verifyPageLoaded();
  }

  /**
   * Verifies error message is displayed with expected text
   * @param expectedMessage - Expected error message
   */
  async assertErrorMessage(expectedMessage: string): Promise<void> {
    await this.verifyErrorMessage(expectedMessage);
  }

  /**
   * Fills login form without submitting (for negative testing)
   * @param email - User email
   * @param password - User password
   * @returns this (for method chaining)
   */
  async fillLoginForm(email: string, password: string): Promise<this> {
    await this.fillCredentials(email, password);
    return this;
  }

  /**
   * Clicks login button
   * @returns this (for method chaining)
   */
  async clickLoginButton(): Promise<this> {
    await this.loginButton.click();
    return this;
  }

  /**
   * Checks if login button is enabled
   * @returns boolean indicating button state
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return this.loginButton.isEnabled();
  }

  /**
   * Asserts email validation error
   * @param expectedError - Expected validation error message
   */
  async assertEmailValidationError(expectedError: string): Promise<void> {
    const emailError = this.page.locator(`text=${expectedError}`);
    await expect(emailError).toBeVisible();
  }

  /**
   * Performs login with invalid credentials (for negative testing)
   * @returns this (for method chaining)
   */
  async loginWithInvalidCredentials(): Promise<this> {
    const credentials = TestDataProvider.getInvalidCredentials();
    return this.performLogin(credentials.username, credentials.password);
  }

  /**
   * Performs login with empty credentials (for validation testing)
   * @returns this (for method chaining)
  */
  async loginWithEmptyCredentials(): Promise<this> {
    const credentials = TestDataProvider.getEmptyCredentials();
    await this.fillCredentials(credentials.username, credentials.password);
    await this.submitLogin();
    return this;
  }

  /**
   * Performs login with empty username only
   * @returns this (for method chaining)
   */
  async loginWithEmptyUsername(): Promise<this> {
    const credentials = TestDataProvider.getAdminCredentials();
    await this.fillCredentials('', credentials.password);
    await this.submitLogin();
    return this;
  }

  /**
   * Performs login with empty password only
   * @returns this (for method chaining)
   */
  async loginWithEmptyPassword(): Promise<this> {
    const credentials = TestDataProvider.getAdminCredentials();
    await this.fillCredentials(credentials.username, '');
    await this.submitLogin();
    return this;
  }

  /**
   * Navigates to forgot password page
   * @returns this (for method chaining)
   */
  async goToForgotPassword(): Promise<this> {
    await this.forgotPasswordLink.click();
    return this;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Internal method to perform login
   * @param username - Username to enter
   * @param password - Password to enter
   * @returns this (for method chaining)
   */
  private async performLogin(username: string, password: string): Promise<this> {
    await this.fillCredentials(username, password);
    await this.submitLogin();
    return this;
  }

  /**
   * Fills in credentials without submitting
   * @param username - Username to enter
   * @param password - Password to enter
   * @returns this (for method chaining)
   */
  private async fillCredentials(username: string, password: string): Promise<this> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    return this;
  }

  /**
   * Submits the login form
   * @returns this (for method chaining)
   */
  private async submitLogin(): Promise<this> {
    await this.loginButton.click();
    return this;
  }

  // ==================== ASSERTIONS ====================

  /**
   * Verifies login page is displayed correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.loginTitle).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Verifies forgot password link is visible
   * Abstraction: hides locator details from tests
   */
  async verifyForgotPasswordLinkVisible(): Promise<void> {
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  /**
   * Verifies login was successful by checking URL
   */
  async verifyLoginSuccessful(): Promise<void> {
    await expect(this.page).toHaveURL(/.*dashboard.*/i);
  }

  /**
   * Verifies error message is displayed
   * @param expectedMessage - Expected error message text
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  /**
   * Verifies invalid credentials error is shown
   */
  async verifyInvalidCredentialsError(): Promise<void> {
    await this.verifyErrorMessage('Invalid credentials');
  }

  /**
   * Verifies required field validation error
   * @param fieldName - Name of the field with error
   */
  async verifyRequiredFieldError(fieldName: string): Promise<void> {
    const fieldError = this.page.locator(`.oxd-input-group:has-text("${fieldName}") .oxd-input-field-error-message`);
    await expect(fieldError).toBeVisible();
  }

  /**
   * Verifies forgot password page is displayed
   */
  async verifyForgotPasswordPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*reset.*/i);
  }
}
