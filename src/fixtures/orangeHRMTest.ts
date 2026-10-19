import { test as base, Page } from '@playwright/test';
import { PageObjectManager } from '../pages/factory/PageObjectManager';
import { IOrangeHRMLoginPage } from '../pages/interfaces/OrangeHRM/IOrangeHRMLoginPage';
import { IOrangeHRMDashboardPage } from '../pages/interfaces/OrangeHRM/IOrangeHRMDashboardPage';
import { aiHelper, AIPromptHelper } from '../ai/aiPromptHelper';

/**
 * OrangeHRM Test Fixtures
 *
 * Implements abstraction by:
 * - Hiding page object instantiation from tests
 * - Providing pre-authenticated sessions via fixtures
 * - Abstracting common setup/teardown logic
 * - Using PageObjectManager for centralized page object lifecycle
 * - Exposing interface types for true abstraction (Ctrl+click → interface, not POM)
 */
type OrangeHRMFixtures = {
  // Page Object Manager - single entry point for all page objects
  pom: PageObjectManager;
  // Individual page objects - exposed as interface types for abstraction
  loginPage: IOrangeHRMLoginPage;
  dashboardPage: IOrangeHRMDashboardPage;
  authenticatedPage: Page;
  // AI Helper - enables heuristic-based self-healing selectors
  aiHelper: AIPromptHelper;
};

export const test = base.extend<OrangeHRMFixtures>({
  // AI Helper fixture - enables self-healing selectors for the test run
  aiHelper: async ({}, use) => {
    aiHelper.enable();
    await use(aiHelper);
  },

  // Page Object Manager fixture - creates single manager per test
  pom: async ({ page }, use) => {
    const pom = new PageObjectManager(page);
    await use(pom);
  },

  // Login page fixture - gets from PageObjectManager
  loginPage: async ({ pom }, use) => {
    await use(pom.orangeHRMLoginPage);
  },

  // Dashboard page fixture - gets from PageObjectManager
  dashboardPage: async ({ pom }, use) => {
    await use(pom.orangeHRMDashboardPage);
  },

  // Authenticated page fixture - automatically logs in user
  // Tests don't need to know HOW login happens, just that user is authenticated
  authenticatedPage: async ({ pom }, use) => {
    // Perform login (credential details hidden from test)
    await pom.orangeHRMLoginPage.navigate();
    await pom.orangeHRMLoginPage.loginAsAdmin();

    // Wait for dashboard to load
    await pom.orangeHRMDashboardPage.waitForPageLoad();

    // Provide authenticated page to test
    await use(pom.page);
  },
});

export { expect } from '@playwright/test';
