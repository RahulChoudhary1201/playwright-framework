import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Playwright Test Configuration
 * Supports multi-browser execution, parallel testing, and comprehensive reporting
 */
export default defineConfig({
  // Test directory configuration
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  expect: {
    timeout: 10000,
  },

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list'],
  ],

  // Global test settings
  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.HEADLESS === 'true',
    viewport: {
      width: parseInt(process.env.VIEWPORT_WIDTH || '1280', 10),
      height: parseInt(process.env.VIEWPORT_HEIGHT || '720', 10),
    },
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Test projects for multi-browser testing
  projects: [
    // API testing project (no browser required)
    {
      name: 'api',
      testMatch: /api.*\.spec\.ts/,
    },

    // Chromium project
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /e2e.*\.spec\.ts/,
    },

    // Firefox project
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /e2e.*\.spec\.ts/,
    },

    // WebKit project (Safari-like)
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /e2e.*\.spec\.ts/,
    },

    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /mobile.*\.spec\.ts/,
    },

    // Mobile Safari
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /mobile.*\.spec\.ts/,
    },
  ],

  // Web server for local development (optional)
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  //   timeout: 120000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
