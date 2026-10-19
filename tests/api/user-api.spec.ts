import { test, expect } from '../../src/fixtures/baseTest';
import { testDataBuilder } from '../../src/fixtures/baseTest';
import { UserRole } from '../../src/types/enums';

/**
 * User API Tests
 * Demonstrates API testing with Zod validation and custom fixtures
 * Tests follow AAA pattern (Arrange, Act, Assert)
 */

test.describe('User API Tests @api', () => {
  test.describe('User Registration', () => {
    test('should create a new user successfully @smoke', async ({ userApiClient }) => {
      // Arrange
      const userData = testDataBuilder.createUserRequest({
        email: `newuser-${Date.now()}@example.com`,
      });

      // Act
      const user = await userApiClient.createUser(userData);

      // Assert
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.id).toBeDefined();
      expect(user.role).toBe('user');

      // Cleanup
      await userApiClient.deleteUser(user.id);
    });

    test('should create user with custom role @regression', async ({ userApiClient }) => {
      // Arrange
      const userData = testDataBuilder.createUserRequest({
        role: UserRole.Admin,
      });

      // Act
      const user = await userApiClient.createUser(userData);

      // Assert
      expect(user.role).toBe('admin');

      // Cleanup
      await userApiClient.deleteUser(user.id);
    });

    test('should fail to create user with invalid email @negative', async ({ userApiClient }) => {
      // Arrange
      const invalidData = testDataBuilder.invalidUserRequest.invalidEmail;

      // Act & Assert
      await expect(userApiClient.createUser(invalidData as any)).rejects.toThrow();
    });

    test('should fail to create user with weak password @negative', async ({ userApiClient }) => {
      // Arrange
      const invalidData = testDataBuilder.invalidUserRequest.weakPassword;

      // Act & Assert
      await expect(userApiClient.createUser(invalidData as any)).rejects.toThrow();
    });
  });

  test.describe('User Authentication', () => {
    test('should login successfully with valid credentials @smoke', async ({ userApiClient }) => {
      // Arrange
      const testUser = await userApiClient.seedTestUser();

      // Act
      const loginResponse = await userApiClient.login({
        email: testUser.credentials.email,
        password: testUser.credentials.password,
      });

      // Assert
      expect(loginResponse.accessToken).toBeDefined();
      expect(loginResponse.refreshToken).toBeDefined();
      expect(loginResponse.user.email).toBe(testUser.credentials.email);

      // Cleanup
      await userApiClient.deleteUser(testUser.user.id);
    });

    test('should fail login with invalid credentials @negative', async ({ userApiClient }) => {
      // Act & Assert
      await expect(
        userApiClient.login({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow();
    });

    test('should logout successfully @regression', async ({ userApiClient }) => {
      // Arrange
      const testUser = await userApiClient.seedTestUser();
      await userApiClient.login(testUser.credentials);

      // Act & Assert - should not throw
      await expect(userApiClient.logout()).resolves.not.toThrow();

      // Cleanup
      await userApiClient.deleteUser(testUser.user.id);
    });
  });

  test.describe('User Retrieval', () => {
    test('should get user by ID @smoke', async ({ userApiClient }) => {
      // Arrange
      const testUser = await userApiClient.seedTestUser();

      // Act
      const user = await userApiClient.getUserById(testUser.user.id);

      // Assert
      expect(user.id).toBe(testUser.user.id);
      expect(user.email).toBe(testUser.user.email);

      // Cleanup
      await userApiClient.deleteUser(testUser.user.id);
    });

    test('should get current authenticated user @regression', async ({ userApiClient }) => {
      // Arrange
      const testUser = await userApiClient.seedTestUser();
      await userApiClient.login(testUser.credentials);

      // Act
      const currentUser = await userApiClient.getCurrentUser();

      // Assert
      expect(currentUser.email).toBe(testUser.credentials.email);

      // Cleanup
      await userApiClient.deleteUser(testUser.user.id);
    });

    test('should list users with pagination @regression', async ({ userApiClient }) => {
      // Arrange
      const testUser = await userApiClient.seedTestUser();

      // Act
      const response = await userApiClient.getUsers(1, 10);

      // Assert
      expect(response.items).toBeInstanceOf(Array);
      expect(response.page).toBe(1);
      expect(response.pageSize).toBe(10);
      expect(response.total).toBeGreaterThanOrEqual(0);

      // Cleanup
      await userApiClient.deleteUser(testUser.user.id);
    });
  });

  test.describe('User Update', () => {
    test('should update user first name and last name @smoke', async ({ userApiClient }) => {
      // Arrange
      const testUser = await userApiClient.seedTestUser();
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      // Act
      const updatedUser = await userApiClient.updateUser(testUser.user.id, updateData);

      // Assert
      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.lastName).toBe(updateData.lastName);

      // Cleanup
      await userApiClient.deleteUser(testUser.user.id);
    });

    test('should update user role @regression', async ({ userApiClient }) => {
      // Arrange
      const testUser = await userApiClient.seedTestUser();
      await userApiClient.login(testUser.credentials);

      // Act
      const updatedUser = await userApiClient.updateUser(testUser.user.id, {
        role: UserRole.Moderator,
      });

      // Assert
      expect(updatedUser.role).toBe('moderator');

      // Cleanup
      await userApiClient.deleteUser(testUser.user.id);
    });
  });

  test.describe('User Deletion', () => {
    test('should delete user successfully @smoke', async ({ userApiClient }) => {
      // Arrange
      const testUser = await userApiClient.seedTestUser();
      const userId = testUser.user.id;

      // Act
      await userApiClient.deleteUser(userId);

      // Assert - should fail to retrieve deleted user
      await expect(userApiClient.getUserById(userId)).rejects.toThrow();
    });
  });
});
