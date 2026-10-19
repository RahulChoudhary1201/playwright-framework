import { test as base, Page } from '@playwright/test';
import { PageObjectManager } from '../pages/factory/PageObjectManager';
import { UserApiClient } from '../apis/UserApiClient';
import { env } from '../utils/env';
import { User, LoginRequest } from '../types/customTypes';
import { UserRole } from '../types/enums';

/**
 * Custom Test Fixtures
 * Extends Playwright's base test with dependency injection for page objects and API clients
 * Uses PageObjectManager for centralized page object lifecycle management
 */

// Define fixture types
type MyFixtures = {
  // Page Object Manager
  pom: PageObjectManager;

  // Individual page objects (backward compatibility)

  // API clients
  userApiClient: UserApiClient;

  // Authenticated context fixtures
  authenticatedPage: Page;
  authenticatedUser: { user: User; credentials: LoginRequest };
};

// Extend base test with custom fixtures
export const test = base.extend<MyFixtures>({
  // Page Object Manager fixture - creates single manager per test
  pom: async ({ page }, use) => {
    const pom = new PageObjectManager(page);
    await use(pom);
  },

  // LoginPage fixture - gets from PageObjectManager

  // UserApiClient fixture - creates API client with request context
  userApiClient: async ({ request }, use) => {
    const userApiClient = new UserApiClient(request, env.API_BASE_URL);
    await use(userApiClient);
  },

  // Authenticated page fixture - automatically logs in user
  authenticatedPage: async ({ pom, userApiClient }, use) => {
    // Perform login via API to get auth token
    const credentials: LoginRequest = {
      email: env.TEST_USERNAME,
      password: env.TEST_PASSWORD,
    };

    await userApiClient.login(credentials);

    // Set authentication cookies/token in browser context
    // Option 1: Set localStorage token
    await pom.page.goto('/');
    await pom.page.evaluate(() => {
      localStorage.setItem('authToken', 'token-from-login');
    });

    // Option 2: Or set cookies (depends on your app's auth mechanism)
    // await pom.page.context().addCookies([{
    //   name: 'auth_token',
    //   value: 'token-from-login',
    //   domain: new URL(env.BASE_URL).hostname,
    //   path: '/',
    // }]);

    await use(pom.page);
  },

  // Authenticated user fixture - provides user data and credentials
  authenticatedUser: async ({ userApiClient }, use) => {
    // Create a test user via API (for test isolation)
    const testUserData = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
    };

    const seededUser = await userApiClient.seedTestUser(testUserData);

    // Use the user in tests
    await use(seededUser);

    // Cleanup: Delete test user after test
    await userApiClient.cleanupTestUser(seededUser.user.id);
  },
});

/**
 * Test data builder fixture for creating test data on demand
 */
export const testDataBuilder = {
  /**
   * Creates a valid user creation request
   */
  createUserRequest: (overrides: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }> = {}): {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  } => ({
    email: `user-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.User,
    ...overrides,
  }),

  /**
   * Creates an invalid user request for negative testing
   */
  invalidUserRequest: {
    noEmail: {
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
    },
    invalidEmail: {
      email: 'invalid-email',
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
    },
    weakPassword: {
      email: 'test@example.com',
      password: 'weak',
      firstName: 'John',
      lastName: 'Doe',
    },
  },
};

// Export expect for convenience
export { expect } from '@playwright/test';
