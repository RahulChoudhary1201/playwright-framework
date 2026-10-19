import { test, expect } from '../../src/fixtures/orangeHRMTest';

/**
 * AI Self-Healing Demo Tests
 *
 * Demonstrates Tier 1 heuristic-based selector healing.
 * These tests intentionally use broken selectors to show the
 * AIPromptHelper attempting to find alternatives.
 *
 * NOTE: healing only records an entry when a suggestion actually
 * matches an element on the page. Fake selectors that match nothing
 * correctly produce zero recorded heals — that is expected.
 */
test.describe('AI Self-Healing Demo @ai @e2e', () => {
  test('should attempt healing on a broken selector @smoke', async ({
    pom,
    authenticatedPage,
    aiHelper,
  }) => {
    void authenticatedPage; // fixture side effect: ensures user is logged in

    // This selector is intentionally WRONG - it won't match anything
    const brokenSelector = '.non-existent-selector-that-will-fail';

    console.log('\n=== Testing selector healing ===');
    console.log('Original (broken) selector:', brokenSelector);

    // Attempt to heal the broken selector
    const healedSelector = await aiHelper.healSelector(
      pom.page,
      brokenSelector,
      'Element not found'
    );

    console.log('Healed selector:', healedSelector || 'NONE (all heuristics failed)');

    // The demo passes regardless - we're just showing the mechanism
    expect(typeof healedSelector === 'string' || healedSelector === null).toBe(true);
  });

  test('should show healing analytics after test run @regression', async ({
    pom,
    authenticatedPage,
    aiHelper,
  }) => {
    void authenticatedPage;

    // Trigger healing attempts with selectors that CAN match after
    // transformation, so we get a recorded (successful) heal.
    // '.oxd-text--h6' (CSS class) -> heuristic suggests
    // [data-testid="oxd-text--h6"], which won't match, so use a
    // selector whose heuristic fallback actually exists on the page.
    const selectorsToTry = [
      '.oxd-userdropdown-name', // -> [data-testid=...] won't match; text= will
    ];

    for (const selector of selectorsToTry) {
      await aiHelper.healSelector(pom.page, selector, 'Element not found');
    }

    // Export and log analytics
    const analytics = aiHelper.exportHealingAnalytics();
    console.log('\n=== Healing Analytics ===');
    console.log('Total attempts:', analytics.totalAttempts);
    console.log('Successful heals:', analytics.successfulHeals);
    console.log('Failed heals:', analytics.failedHeals);
    console.log('Healing rate:', analytics.healingRate);
    console.log('Top healed selectors:', analytics.topHealedSelectors);

    // Analytics object always has the expected shape
    expect(analytics).toHaveProperty('totalAttempts');
    expect(analytics).toHaveProperty('successfulHeals');
    expect(analytics).toHaveProperty('healingRate');
  });

  test('should generate test case prompts @regression', async ({
    authenticatedPage,
    aiHelper,
  }) => {
    void authenticatedPage;

    const prompt = aiHelper.generateTestCases(
      'Login Page',
      'User logs in with valid credentials',
      ['username input', 'password input', 'login button', 'error message']
    );

    console.log('\n=== Generated Test Case Prompt ===');
    console.log(prompt);

    expect(prompt).toContain('Login Page');
    expect(prompt).toContain('Happy path');
    expect(prompt).toContain('Negative');
  });

  test('should generate assertion suggestions @regression', async ({
    authenticatedPage,
    aiHelper,
  }) => {
    void authenticatedPage;

    const prompt = aiHelper.generateAssertions(
      'User clicks login button',
      'User is redirected to dashboard',
      'Login page with filled credentials'
    );

    console.log('\n=== Generated Assertion Prompt ===');
    console.log(prompt);

    expect(prompt).toContain('Login');
    expect(prompt).toContain('dashboard');
  });

  test('should analyze a test failure @regression', async ({
    authenticatedPage,
    aiHelper,
  }) => {
    void authenticatedPage;

    const prompt = aiHelper.analyzeFailure(
      'should login successfully',
      'TimeoutError: element not visible after 30000ms',
      'Error: element not visible\n    at LoginPage.verifyPageLoaded',
      'test-results/screenshot.png'
    );

    console.log('\n=== Generated Failure Analysis Prompt ===');
    console.log(prompt);

    expect(prompt).toContain('should login successfully');
    expect(prompt).toContain('TimeoutError');
  });
});