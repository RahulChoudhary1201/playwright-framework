import { APIRequestContext } from '@playwright/test';
import { UserRole } from '../types/enums';
import { BaseApiClient } from './BaseApiClient';
import {
  User,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  UpdateUserRequest,
  UserListResponse,
  UserSchema,
  LoginResponseSchema,
  UserListResponseSchema,
  ApiResponseSchema,
} from '../dtos/user.dto';
import { env } from '../utils/env';

/**
 * User API Client
 * Encapsulates all User-related API operations
 * Follows Repository Pattern for clean separation of concerns
 */
export class UserApiClient extends BaseApiClient {
  private readonly userEndpoint = '/users';
  private readonly authEndpoint = '/auth';

  constructor(request: APIRequestContext, baseUrl: string = env.API_BASE_URL) {
    super(request, baseUrl);
  }

  /**
   * Authenticates user and sets auth token for subsequent requests
   * @param credentials - Login credentials
   * @returns Login response with tokens and user data
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginRequest>(
      `${this.authEndpoint}/login`,
      credentials
    );

    this.logRequest('POST', `${this.authEndpoint}/login`, response.status());
    await this.assertStatus(response, 200);

    const validatedResponse = await this.validateResponse(
      response,
      LoginResponseSchema
    );

    // Set auth token for subsequent requests
    this.setAuthToken(validatedResponse.accessToken);

    return validatedResponse;
  }

  /**
   * Logs out current user
   */
  async logout(): Promise<void> {
    const response = await this.post(`${this.authEndpoint}/logout`, {});
    this.logRequest('POST', `${this.authEndpoint}/logout`, response.status());
    await this.assertStatus(response, 200);
    this.clearAuthToken();
  }

  /**
   * Creates a new user
   * @param userData - User creation payload
   * @returns Created user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.post<CreateUserRequest>(
      this.userEndpoint,
      userData
    );

    this.logRequest('POST', this.userEndpoint, response.status());
    await this.assertStatus(response, 201);

    const apiResponse = await this.validateResponse(
      response,
      ApiResponseSchema(UserSchema)
    );

    return apiResponse.data;
  }

  /**
   * Retrieves user by ID
   * @param userId - User UUID
   * @returns User data
   */
  async getUserById(userId: string): Promise<User> {
    const response = await this.get(`${this.userEndpoint}/${userId}`);

    this.logRequest('GET', `${this.userEndpoint}/${userId}`, response.status());
    await this.assertStatus(response, 200);

    const apiResponse = await this.validateResponse(
      response,
      ApiResponseSchema(UserSchema)
    );

    return apiResponse.data;
  }

  /**
   * Retrieves all users with pagination
   * @param page - Page number
   * @param pageSize - Number of items per page
   * @returns Paginated user list
   */
  async getUsers(page: number = 1, pageSize: number = 10): Promise<UserListResponse> {
    const response = await this.get(this.userEndpoint, { page, pageSize });

    this.logRequest('GET', this.userEndpoint, response.status());
    await this.assertStatus(response, 200);

    return await this.validateResponse(response, UserListResponseSchema);
  }

  /**
   * Updates user information
   * @param userId - User UUID
   * @param userData - Partial user data to update
   * @returns Updated user
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    const response = await this.patch<UpdateUserRequest>(
      `${this.userEndpoint}/${userId}`,
      userData
    );

    this.logRequest('PATCH', `${this.userEndpoint}/${userId}`, response.status());
    await this.assertStatus(response, 200);

    const apiResponse = await this.validateResponse(
      response,
      ApiResponseSchema(UserSchema)
    );

    return apiResponse.data;
  }

  /**
   * Deletes user by ID
   * @param userId - User UUID
   */
  async deleteUser(userId: string): Promise<void> {
    const response = await this.delete(`${this.userEndpoint}/${userId}`);

    this.logRequest('DELETE', `${this.userEndpoint}/${userId}`, response.status());
    await this.assertStatus(response, 204);
  }

  /**
   * Gets current authenticated user profile
   * @returns Current user data
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.get(`${this.userEndpoint}/me`);

    this.logRequest('GET', `${this.userEndpoint}/me`, response.status());
    await this.assertStatus(response, 200);

    const apiResponse = await this.validateResponse(
      response,
      ApiResponseSchema(UserSchema)
    );

    return apiResponse.data;
  }

  /**
   * Seeds test user data via API (for test setup)
   * @param userData - Optional custom user data
   * @returns Created test user
   */
  async seedTestUser(
    userData?: Partial<CreateUserRequest>
  ): Promise<{ user: User; credentials: LoginRequest }> {
    const defaultUserData: CreateUserRequest = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.User,
      ...userData,
    };

    const user = await this.createUser(defaultUserData);

    return {
      user,
      credentials: {
        email: defaultUserData.email,
        password: defaultUserData.password,
      },
    };
  }

  /**
   * Cleanup: Deletes test user
   * @param userId - User UUID to delete
   */
  async cleanupTestUser(userId: string): Promise<void> {
    try {
      await this.deleteUser(userId);
    } catch (error) {
      console.warn(`Failed to cleanup test user ${userId}:`, error);
    }
  }
}
