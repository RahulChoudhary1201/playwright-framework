import { APIRequestContext, APIResponse } from '@playwright/test';
import { z } from 'zod';
import { env } from '../utils/env';

/**
 * Base API Client
 * Provides common HTTP methods and response validation for all API clients
 * Follows Repository Pattern for API abstraction
 */
export abstract class BaseApiClient {
  protected readonly request: APIRequestContext;
  protected readonly baseUrl: string;
  protected readonly defaultHeaders: Record<string, string>;

  constructor(request: APIRequestContext, baseUrl: string = env.API_BASE_URL) {
    this.request = request;
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Sets authentication header for subsequent requests
   * @param token - Bearer token for authentication
   */
  protected setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Removes authentication header
   */
  protected clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Constructs full URL from endpoint path
   * @param endpoint - API endpoint path
   * @returns Full URL
   */
  protected buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns API Response
   */
  protected async get(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<APIResponse> {
    return this.request.get(this.buildUrl(endpoint), {
      headers: this.defaultHeaders,
      params,
    });
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns API Response
   */
  protected async post<T>(endpoint: string, data: T): Promise<APIResponse> {
    return this.request.post(this.buildUrl(endpoint), {
      headers: this.defaultHeaders,
      data,
    });
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns API Response
   */
  protected async put<T>(endpoint: string, data: T): Promise<APIResponse> {
    return this.request.put(this.buildUrl(endpoint), {
      headers: this.defaultHeaders,
      data,
    });
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns API Response
   */
  protected async patch<T>(endpoint: string, data: Partial<T>): Promise<APIResponse> {
    return this.request.patch(this.buildUrl(endpoint), {
      headers: this.defaultHeaders,
      data,
    });
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @returns API Response
   */
  protected async delete(endpoint: string): Promise<APIResponse> {
    return this.request.delete(this.buildUrl(endpoint), {
      headers: this.defaultHeaders,
    });
  }

  /**
   * Validates response body against Zod schema
   * @param response - API Response
   * @param schema - Zod schema for validation
   * @returns Validated data
   * @throws ZodError if validation fails
   */
  protected async validateResponse<T>(
    response: APIResponse,
    schema: z.ZodType<T>
  ): Promise<T> {
    const body = await response.json();
    return schema.parse(body);
  }

  /**
   * Asserts response status code
   * @param response - API Response
   * @param expectedStatus - Expected HTTP status code
   * @throws Error if status doesn't match
   */
  protected async assertStatus(
    response: APIResponse,
    expectedStatus: number
  ): Promise<void> {
    const actualStatus = response.status();
    if (actualStatus !== expectedStatus) {
      const body = await response.text();
      throw new Error(
        `Expected status ${expectedStatus}, but got ${actualStatus}. Response: ${body}`
      );
    }
  }

  /**
   * Logs request/response details for debugging
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param status - Response status code
   */
  protected logRequest(
    method: string,
    endpoint: string,
    status: number
  ): void {
    console.log(`[${method}] ${endpoint} - Status: ${status}`);
  }
}
