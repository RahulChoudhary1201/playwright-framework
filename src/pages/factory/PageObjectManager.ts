import { Page } from '@playwright/test';
import { pageObjectRegistry, POMContext, POMFactory } from './registry';
import { IOrangeHRMLoginPage } from '../interfaces/OrangeHRM/IOrangeHRMLoginPage';
import { IOrangeHRMDashboardPage } from '../interfaces/OrangeHRM/IOrangeHRMDashboardPage';

/**
 * Page Object Manager
 *
 * Centralized manager for all page objects. Implements a registry
 * pattern so it scales to 100+ POMs without growing this file:
 *   - Each POM is registered as a factory in factory/registry.ts (one line)
 *   - The manager resolves lazily through a generic get(token, ctx)
 *   - Instances are cached per test (singleton-per-test scope)
 *
 * Friendly typed getters are kept for the high-traffic page objects
 * so tests keep their readable `pom.loginPage` style.
 */
export class PageObjectManager {
  public readonly page: Page;
  private readonly registry: Record<string, POMFactory>;
  private readonly cache = new Map<string, unknown>();

  constructor(page: Page, registry: Record<string, POMFactory> = pageObjectRegistry) {
    this.page = page;
    this.registry = registry;
  }

  // ==================== SHARED CONTEXT ====================

  /**
   * Builds the context every factory receives.
   * Central knob for injecting new cross-cutting deps into any POM.
   */
  private get context(): POMContext {
    return { page: this.page };
  }

  // ==================== GENERIC RESOLVER ====================

  /**
   * Resolves a page object by registry token.
   * Lazy + cached: first access constructs, subsequent accesses reuse.
   * @param token - Registry key for the page object
   * @param ctx - Shared context passed to the factory
   * @returns The constructed page object instance
   */
  get<TFace>(token: string, ctx: POMContext = this.context): TFace {
    const cached = this.cache.get(token);
    if (cached) return cached as TFace;

    const factory = this.registry[token];
    if (!factory) throw new Error(`Unknown page object: "${token}"`);

    const instance = factory(ctx);
    this.cache.set(token, instance);
    return instance as TFace;
  }

  // ==================== TYPED GETTERS (high-traffic POMs) ====================

  /**
   * OrangeHRM Login Page — interface type, so Ctrl+click goes to the contract
   */
  get orangeHRMLoginPage(): IOrangeHRMLoginPage {
    return this.get<IOrangeHRMLoginPage>('orangeHRMLogin');
  }

  /**
   * OrangeHRM Dashboard Page — interface type, so Ctrl+click goes to the contract
   */
  get orangeHRMDashboardPage(): IOrangeHRMDashboardPage {
    return this.get<IOrangeHRMDashboardPage>('orangeHRMDashboard');
  }

  // ==================== LIFECYCLE MANAGEMENT ====================

  /**
   * Resets all cached page object instances.
   * Useful when navigating to a completely different context
   * or when a test needs fresh page object state.
   */
  reset(): void {
    this.cache.clear();
  }

  /**
   * Gets all cached page object instances for introspection/cleanup.
   */
  getAllPages(): Record<string, unknown> {
    return Object.fromEntries(this.cache);
  }
}