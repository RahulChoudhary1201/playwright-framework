import { env } from './env';

/**
 * Test Data Provider
 *
 * Single responsibility: organizes and provides test credentials/roles.
 * Does NOT own environment parsing — that lives in env.ts.
 * Add new roles here without touching environment configuration.
 */
export class TestDataProvider {
  private static readonly credentials = {
    admin: {
      username: env.ORANGEHRM_USERNAME,
      password: env.ORANGEHRM_PASSWORD,
    },
    // Add more users as needed
    // user: { username: env.USER_USERNAME, password: env.USER_PASSWORD },
  };

  /**
   * Gets admin credentials for testing
   * @returns Admin credentials object
   */
  static getAdminCredentials(): { username: string; password: string } {
    return { ...this.credentials.admin };
  }

  /**
   * Gets credentials for a specific role
   * @param role - User role (admin, user, etc.)
   * @returns Credentials for the specified role
   */
  static getCredentials(role: 'admin' = 'admin'): { username: string; password: string } {
    return { ...this.credentials[role] };
  }

  /**
   * Gets invalid credentials for negative testing
   * @returns Invalid credentials object
   */
  static getInvalidCredentials(): { username: string; password: string } {
    return {
      username: 'invalid_user',
      password: 'invalid_password',
    };
  }

  /**
   * Gets empty credentials for validation testing
   * @returns Empty credentials object
   */
  static getEmptyCredentials(): { username: string; password: string } {
    return {
      username: '',
      password: '',
    };
  }
}