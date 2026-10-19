import { Page, Locator } from '@playwright/test';

/**
 * AI Prompt Helper
 * Provides utilities for LLM-driven test automation
 * Supports self-healing selectors and prompt templates for AI integration
 */

// AI Configuration
interface AIConfig {
  enabled: boolean;
  maxRetries: number;
  fallbackStrategy: 'skip' | 'fail' | 'manual';
}

const defaultAIConfig: AIConfig = {
  enabled: false,
  maxRetries: 3,
  fallbackStrategy: 'fail',
};

/**
 * Prompt templates for LLM interactions
 */
export const PromptTemplates = {
  // Self-healing selector prompt
  selfHealingSelector: `
Given the following failed selector and page context, suggest alternative selectors:

Failed Selector: {selector}
Page URL: {url}
Error: {error}
Page HTML Snippet: {htmlSnippet}

Provide up to 3 alternative selectors in order of preference:
1. data-testid selector (preferred)
2. role-based selector
3. text-based selector

Format: JSON array of selector strings
`,

  // Element description generator
  elementDescription: `
Describe the following element for accessibility testing:

Element HTML: {html}
Current description: {currentDescription}

Provide:
1. Accessible name suggestion
2. Role suggestion
3. Any accessibility issues found
`,

  // Test case generator
  testCaseGenerator: `
Generate test cases for the following user flow:

Page: {pageName}
User Flow: {userFlow}
Elements: {elements}

Generate:
1. Happy path test case
2. Negative test cases
3. Edge cases
`,

  // Assertion suggestion
  assertionSuggestion: `
Suggest assertions for the following test step:

Test Step: {testStep}
Expected Outcome: {expectedOutcome}
Page State: {pageState}

Provide specific Playwright assertions using expect().
`,

  // Error analysis
  errorAnalysis: `
Analyze the following test failure:

Test Name: {testName}
Error Message: {errorMessage}
Stack Trace: {stackTrace}
Page Screenshot: {screenshotPath}

Provide:
1. Root cause analysis
2. Suggested fix
3. Prevention recommendations
`,
};

/**
 * Selector healing result
 */
interface SelectorHealingResult {
  original: string;
  suggested: string;
  confidence: number;
  reasoning: string;
}

/**
 * AI Helper class for LLM-driven test automation
 */
export class AIPromptHelper {
  private config: AIConfig;
  private healingHistory: Map<string, SelectorHealingResult[]>;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...defaultAIConfig, ...config };
    this.healingHistory = new Map();
  }

  /**
   * Enables AI features
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * Disables AI features
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Attempts to find alternative selector when original fails
   * @param page - Playwright page object
   * @param originalSelector - Failed selector
   * @param error - Error message
   * @returns Healed selector or null if unable to heal
   */
  async healSelector(
    page: Page,
    originalSelector: string,
    error: string
  ): Promise<string | null> {
    if (!this.config.enabled) {
      return null;
    }

    const url = page.url();
    let htmlSnippet = '';

    try {
      // Get surrounding HTML context
      htmlSnippet = await page.evaluate(() => {
        // @ts-expect-error - document is available in browser context
        return document.body.innerHTML.substring(0, 5000);
      });
    } catch {
      // Unable to get HTML, proceed without context
    }

    // In real implementation, this would call an LLM API
    // For now, we'll implement basic heuristic-based healing
    const suggestions = await this.suggestAlternativeSelectors(
      originalSelector,
      url,
      error,
      htmlSnippet
    );

    if (suggestions.length === 0) {
      return null;
    }

    // Test each suggestion
    for (const suggestion of suggestions) {
      try {
        const locator = page.locator(suggestion);
        const count = await locator.count();
        if (count > 0) {
          // Record successful healing
          this.recordHealing(originalSelector, {
            original: originalSelector,
            suggested: suggestion,
            confidence: 0.8,
            reasoning: 'Heuristic-based selector found',
          });

          return suggestion;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * Generates alternative selector suggestions using heuristics
   * In production, this would be replaced with LLM API calls
   */
  private async suggestAlternativeSelectors(
    originalSelector: string,
    _url: string,
    _error: string,
    _htmlSnippet: string
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Heuristic 1: Try data-testid if CSS selector
    if (originalSelector.startsWith('.') || originalSelector.startsWith('#')) {
      const testId = originalSelector.replace(/^[.#]/, '');
      suggestions.push(`[data-testid="${testId}"]`);
    }

    // Heuristic 2: Try role-based selector
    suggestions.push(`[aria-label*="${originalSelector}"]`);

    // Heuristic 3: Try text-based selector
    suggestions.push(`text=${originalSelector}`);

    return suggestions;
  }

  /**
   * Records healing attempt for analytics
   */
  private recordHealing(key: string, result: SelectorHealingResult): void {
    if (!this.healingHistory.has(key)) {
      this.healingHistory.set(key, []);
    }
    this.healingHistory.get(key)!.push(result);
  }

  /**
   * Gets healing history for a selector
   */
  getHealingHistory(selector: string): SelectorHealingResult[] {
    return this.healingHistory.get(selector) || [];
  }

  /**
   * Generates test case suggestions
   */
  generateTestCases(pageName: string, userFlow: string, elements: string[]): string {
    const template = PromptTemplates.testCaseGenerator;
    return template
      .replace('{pageName}', pageName)
      .replace('{userFlow}', userFlow)
      .replace('{elements}', elements.join(', '));
  }

  /**
   * Generates assertion suggestions
   */
  generateAssertions(testStep: string, expectedOutcome: string, pageState: string): string {
    const template = PromptTemplates.assertionSuggestion;
    return template
      .replace('{testStep}', testStep)
      .replace('{expectedOutcome}', expectedOutcome)
      .replace('{pageState}', pageState);
  }

  /**
   * Analyzes test failure and provides suggestions
   */
  analyzeFailure(
    testName: string,
    errorMessage: string,
    stackTrace: string,
    screenshotPath?: string
  ): string {
    const template = PromptTemplates.errorAnalysis;
    return template
      .replace('{testName}', testName)
      .replace('{errorMessage}', errorMessage)
      .replace('{stackTrace}', stackTrace)
      .replace('{screenshotPath}', screenshotPath || 'N/A');
  }

  /**
   * Creates self-healing locator wrapper
   * @param page - Playwright page
   * @param selector - Original selector
   * @returns Locator with self-healing capability
   */
  createSelfHealingLocator(page: Page, selector: string): Locator {
    const baseLocator = page.locator(selector);

    // In a real implementation, this would wrap the locator
    // with retry logic and LLM-based healing
    return baseLocator;
  }

  /**
   * Exports healing analytics for reporting
   */
  exportHealingAnalytics(): {
    totalAttempts: number;
    successfulHeals: number;
    failedHeals: number;
    healingRate: number;
    topHealedSelectors: Array<{ selector: string; count: number }>;
  } {
    let totalAttempts = 0;
    let successfulHeals = 0;

    const selectorCounts: Map<string, number> = new Map();

    this.healingHistory.forEach((results, selector) => {
      totalAttempts += results.length;
      successfulHeals += results.filter((r) => r.confidence > 0.7).length;

      selectorCounts.set(selector, results.length);
    });

    const topHealedSelectors = Array.from(selectorCounts.entries())
      .map(([selector, count]) => ({ selector, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalAttempts,
      successfulHeals,
      failedHeals: totalAttempts - successfulHeals,
      healingRate: totalAttempts > 0 ? successfulHeals / totalAttempts : 0,
      topHealedSelectors,
    };
  }
}

// Export singleton instance
export const aiHelper = new AIPromptHelper();
