import { Page } from '@playwright/test';
import { OrangeHRMLoginPage } from '../impl/OrangeHRM/OrangeHRMLoginPage';
import { OrangeHRMDashboardPage } from '../impl/OrangeHRM/OrangeHRMDashboardPage';

/**
 * Shared context passed to every page object factory.
 * Add new cross-cutting deps here as the framework grows
 * (e.g. api client, auth token, feature flags).
 */
export type POMContext = {
  page: Page;
};

/**
 * A factory that constructs a page object from the shared context.
 * Using factories (not raw constructors) means each POM can declare
 * whatever constructor signature it needs — the manager stays generic.
 */
export type POMFactory = (ctx: POMContext) => unknown;

/**
 * Page Object Registry
 *
 * One declarative entry per page object. Adding the 100th POM is still
 * one line — no manager edits, no shared mega-file. The wiring lives
 * next to the code it describes.
 */
export const pageObjectRegistry: Record<string, POMFactory> = {
  orangeHRMLogin: (ctx) => new OrangeHRMLoginPage(ctx.page),
  orangeHRMDashboard: (ctx) => new OrangeHRMDashboardPage(ctx.page),
  // Adding a POM with extra deps — still one line:
  // someNewPage: (ctx) => new SomeNewPage(ctx.page, ctx.api),
};