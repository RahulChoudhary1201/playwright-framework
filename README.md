# Playwright Test Automation Framework

Enterprise-grade test automation framework using Playwright with TypeScript, following industry best practices and SOLID principles.

## Features

- **Page Object Model (POM)** - UI encapsulation with reusable page objects
- **Interface/Implementation Separation** - Contract-first POMs; Ctrl+click on a method navigates to the interface, not the implementation
- **Page Object Manager (Registry)** - Centralized, lazy, cached resolution of page objects; scales to 100+ POMs with one registry line each
- **Repository Pattern** - API clients for clean abstraction
- **Factory/Builder Pattern** - Test data generation
- **Custom Fixtures** - Dependency injection for page objects and API clients
- **Hybrid API + UI Testing** - Seed data via API, test via UI
- **Zod Validation** - Runtime schema validation for API responses
- **Shared Enums** - Single source of truth for fixed value sets (roles, sort direction)
- **Multi-Browser Support** - Chromium, Firefox, WebKit, Mobile
- **Parallel Execution** - Fast test execution with worker processes
- **Allure Reporting** - Comprehensive HTML test reports
- **AI/MCP Ready** - Infrastructure for LLM-driven self-healing selectors

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run postinstall
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
BASE_URL=https://your-application.com
API_BASE_URL=https://api.your-application.com
ORANGEHRM_USERNAME=Admin
ORANGEHRM_PASSWORD=admin123
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Run specific test file
npx playwright test tests/e2e/orangehrm-login.spec.ts

# Run API tests only
npm run test:api

# Run E2E tests only
npm run test:e2e

# Run tests in parallel
npm run test:parallel

# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression

# Debug tests
npm run test:debug
```

## Project Structure

```
playwright-framework/
├── .mcp/                    # MCP/AI configuration
│   └── config.json
├── src/
│   ├── ai/                  # AI/LLM helper utilities
│   │   └── aiPromptHelper.ts
│   ├── apis/                # API clients (Repository Pattern)
│   │   ├── BaseApiClient.ts
│   │   └── UserApiClient.ts
│   ├── dtos/                # Data Transfer Objects with Zod schemas
│   │   └── user.dto.ts
│   ├── fixtures/            # Custom test fixtures
│   │   ├── baseTest.ts
│   │   └── orangeHRMTest.ts
│   ├── pages/
│   │   ├── factory/         # Page Object Manager + registry (Facade + Registry pattern)
│   │   │   ├── PageObjectManager.ts
│   │   │   └── registry.ts
│   │   ├── interfaces/      # POM contracts (Ctrl+click → interface, not impl)
│   │   │   └── OrangeHRM/
│   │   │       ├── IOrangeHRMLoginPage.ts
│   │   │       ├── IOrangeHRMDashboardPage.ts
│   │   │       └── IOrangeHRMAdminPage.ts
│   │   └── impl/            # POM implementations (hidden from tests)
│   │       └── OrangeHRM/
│   │           ├── OrangeHRMLoginPage.ts
│   │           ├── OrangeHRMDashboardPage.ts
│   │           └── OrangeHRMAdminPage.ts
│   ├── types/               # TypeScript type definitions and shared enums
│   │   ├── customTypes.ts
│   │   └── enums.ts
│   └── utils/               # Utility functions
│       ├── env.ts           # Environment config (Zod-validated)
│       └── TestDataProvider.ts  # Test credential/role provider
├── tests/
│   ├── api/                 # API tests
│   │   └── user-api.spec.ts
│   └── e2e/                 # End-to-end tests
│       ├── orangehrm-dashboard.spec.ts
│       └── orangehrm-login.spec.ts
├── playwright.config.ts     # Playwright configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
```

## Architecture

### Page Object Model

Page objects encapsulate UI elements and actions. Each POM is split into a
**contract** (`interfaces/`) and an **implementation** (`impl/`), so tests see
only the interface — Ctrl+click on any method navigates to the contract, not
the implementation logic:

```typescript
// Tests interact with the interface only
await pom.orangeHRMLoginPage.navigate();
await pom.orangeHRMLoginPage.loginAsAdmin();
await pom.orangeHRMDashboardPage.verifyPageLoaded();
```

### Page Object Manager (Registry)

`PageObjectManager` centralizes page object lifecycle. It is a **registry**,
not a facade: `pages/factory/registry.ts` holds one declarative entry per POM,
and the manager resolves them lazily through `pom.get<TFace>(token, ctx)`.
Instances are cached per test, so adding the 100th POM costs one registry line
— no manager edits:

```typescript
// pages/factory/registry.ts — one line per POM
import { OrangeHRMLoginPage } from '../impl/OrangeHRM/OrangeHRMLoginPage';
import { OrangeHRMAdminPage } from '../impl/OrangeHRM/OrangeHRMAdminPage';

export const pageObjectRegistry: Record<string, POMFactory> = {
  orangeHRMLogin: (ctx) => new OrangeHRMLoginPage(ctx.page),
  orangeHRMDashboard: (ctx) => new OrangeHRMDashboardPage(ctx.page),
  orangeHRMAdmin: (ctx) => new OrangeHRMAdminPage(ctx.page),
  // A POM with extra deps — still one line:
  // someNewPage: (ctx) => new SomeNewPage(ctx.page, ctx.api),
};
```

To use a POM from a test, resolve it by token — the manager constructs it on
first access and reuses the same instance for the rest of the test:

```typescript
const adminPage = pom.get<IOrangeHRMAdminPage>('orangeHRMAdmin');
await adminPage.verifyPageLoaded();
```

**To add a new POM, three steps — and only step 3 touches the manager:**
1. Create the interface under `pages/interfaces/`
2. Create the implementation under `pages/impl/`
3. Add one factory line to `pages/factory/registry.ts`

### API Client Pattern

API clients provide clean abstraction for backend operations:

```typescript
// Example: Using UserApiClient
const testUser = await userApiClient.seedTestUser({
  email: 'test@example.com',
  firstName: 'Test',
});
await userApiClient.deleteUser(testUser.user.id);
```

### Custom Fixtures

Fixtures provide dependency injection. OrangeHRM tests use the `orangeHRMTest`
fixture set, which exposes interface-typed page objects and an
`authenticatedPage` fixture that performs login automatically — tests don't
need to know *how* login happens, only that the user is authenticated:

```typescript
// Fixtures are automatically injected
test('should display dashboard', async ({ pom, authenticatedPage }) => {
  void authenticatedPage; // fixture side effect: ensures user is logged in
  await pom.orangeHRMDashboardPage.verifyPageLoaded();
});
```

### Shared Enums

Fixed value sets live in `types/enums.ts` as real enums (`UserRole`,
`SortDirection`). DTO schemas derive from them (`z.nativeEnum(UserRole)`) so
there's a single source of truth — no magic strings can drift:

```typescript
import { UserRole } from '../types/enums';
const user = testDataBuilder.createUserRequest({ role: UserRole.Admin });
```

### Data Validation

Zod schemas validate API responses:

```typescript
// Automatic validation in API client
const user = await userApiClient.getUserById(userId);
// Response is validated against UserSchema
```

## Test Tags

Use tags to organize and filter tests:

- `@smoke` - Critical smoke tests
- `@regression` - Regression test suite
- `@api` - API-only tests
- `@e2e` - End-to-end UI tests
- `@negative` - Negative test cases
- `@integration` - Integration tests

Run tests by tag:
```bash
npx playwright test --grep @smoke
```

## Reporting

### HTML Report

```bash
npm run report:html
```

### Allure Report

```bash
npm run report
```

## Best Practices

1. **Use Page Objects** - Never interact with page elements directly in tests
2. **Seed Data via API** - Use API clients for test data setup, not UI
3. **Validate Responses** - All API responses are validated with Zod schemas
4. **Clean Up Data** - Always clean up test data after tests
5. **Use Tags** - Tag tests for easy filtering and organization
6. **Follow AAA Pattern** - Arrange, Act, Assert in all tests
7. **Keep Tests Independent** - Each test should be self-contained

## Type Safety

This framework uses strict TypeScript:

- Strict null checks enabled
- No implicit any
- Full type inference
- Zod runtime validation

## AI/MCP Features

The framework includes infrastructure for AI-driven testing:

- **Self-healing selectors** - Automatic selector recovery
- **Test generation** - LLM-powered test case suggestions
- **Error analysis** - AI-powered failure analysis
- **Prompt templates** - Ready-to-use LLM prompts

Enable in `.mcp/config.json`.

### Current AI Tier: Heuristic Self-Healing (Tier 1)

The framework ships with heuristic-based selector healing — no external API
calls, no cost, no secrets. When a locator fails, `AIPromptHelper.healSelector()`
tries local fallbacks in priority order:

1. `data-testid` — derived from the failed CSS class/id selector
2. `aria-label` — matches the selector text against accessible labels
3. `text=` — matches the selector text against visible text

Each suggestion is tested with `locator.count()`; the first match wins and is
recorded in healing analytics. If none match, it returns `null`.

**To enable:** set `enableSelfHealing: true` in `.mcp/config.json` and request
the `aiHelper` fixture:

```typescript
test('should heal a broken selector', async ({ aiHelper, pom }) => {
  const healed = await aiHelper.healSelector(pom.page, '.broken-class', 'Element not found');
  // healed is the working selector, or null
});
```

Healing analytics are exported via `aiHelper.exportHealingAnalytics()` and
logged automatically at the end of a test run. Prompt templates for test-case
generation, assertion suggestions, and failure analysis are available through
`generateTestCases()`, `generateAssertions()`, and `analyzeFailure()`.

**Future tiers:** Tier 2 would wire real LLM calls (OpenAI/Anthropic) into
`healSelector()` / the prompt methods; Tier 3 would run an external Playwright
MCP server giving the LLM full browser control. Both are behind the same
`AIPromptHelper` API — no test changes required.

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## License

MIT
