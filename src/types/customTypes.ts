import { Page, APIRequestContext } from '@playwright/test';
import { UserRole, SortDirection } from './enums';

/**
 * Custom Type Definitions
 * Provides type safety across the framework
 */

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  statusCode: number;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortDirection;
}

// Test context types
export interface TestContext {
  user?: User;
  authToken?: string;
  testId?: string;
}

// Page Object constructor type for dependency injection
export interface PageObjectConstructor<T extends BasePageObject> {
  new (page: Page): T;
}

// Base page object interface
export interface BasePageObject {
  readonly page: Page;
  navigate(): Promise<this>;
  waitForLoad(): Promise<this>;
}

// API Client constructor type
export interface ApiClientConstructor<T extends BaseApiClient> {
  new (request: APIRequestContext, baseUrl: string): T;
}

// Base API client interface
export interface BaseApiClient {
  readonly request: APIRequestContext;
  readonly baseUrl: string;
}

// Test fixture types
export interface AuthenticatedUser {
  user: User;
  authToken: string;
}

// Environment type (re-exported for convenience)
export type { Environment } from '../utils/env';

// Test data builder types
export type TestDataBuilder<T> = {
  build(): T;
  with<K extends keyof T>(key: K, value: T[K]): TestDataBuilder<T>;
};

// Assertion helpers
export type SoftAssertionResult = {
  passed: boolean;
  message?: string;
};
