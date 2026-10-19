import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Environment Configuration Schema
 * Uses Zod for runtime validation of environment variables
 * Ensures type safety and catches configuration errors early
 */

// Define environment schema with Zod
const envSchema = z.object({
  // Application URLs
  BASE_URL: z.string().url().default('https://opensource-demo.orangehrmlive.com'),
  API_BASE_URL: z.string().url().default('https://api.example.com'),

  // OrangeHRM credentials
  ORANGEHRM_USERNAME: z.string().default('Admin'),
  ORANGEHRM_PASSWORD: z.string().default('admin123'),

  // Generic test credentials (for baseTest fixtures)
  TEST_USERNAME: z.string().email().default('test@example.com'),
  TEST_PASSWORD: z.string().min(1).default('TestPassword123!'),

  // API credentials
  API_KEY: z.string().optional(),
  API_SECRET: z.string().optional(),

  // Test configuration
  HEADLESS: z.string().transform((val) => val === 'true').default('true'),
  SLOW_MO: z.string().transform((val) => parseInt(val, 10)).default('0'),
  TIMEOUT: z.string().transform((val) => parseInt(val, 10)).default('30000'),

  // Environment
  ENVIRONMENT: z.enum(['local', 'dev', 'staging', 'prod']).default('staging'),

  // Browser configuration
  BROWSER: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
  VIEWPORT_WIDTH: z.string().transform((val) => parseInt(val, 10)).default('1280'),
  VIEWPORT_HEIGHT: z.string().transform((val) => parseInt(val, 10)).default('720'),

  // Reporting
  ALLURE_RESULTS_DIR: z.string().default('allure-results'),

  // AI/MCP Configuration
  ENABLE_AI_SELF_HEALING: z.string().transform((val) => val === 'true').default('false'),
  MCP_ENABLED: z.string().transform((val) => val === 'true').default('false'),
});

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Parse and validate environment variables
 * Throws clear error messages if validation fails
 */
function validateEnv(): z.infer<typeof envSchema> {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment configuration:');
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  return parsed.data;
}

// Export validated environment configuration
export const env = validateEnv();

// Type-safe environment access
export type Environment = z.infer<typeof envSchema>;
