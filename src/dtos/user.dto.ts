import { z } from 'zod';
import { UserRole as UserRoleEnum } from '../types/enums';

/**
 * User Data Transfer Objects (DTOs)
 * Defines Zod schemas and TypeScript interfaces for User entity
 * Provides runtime validation and type safety for API payloads
 */

// User role enum schema
// Backed by the shared UserRole enum so there is a single source of
// truth — the enum and this schema can never drift.
export const UserRoleSchema = z.nativeEnum(UserRoleEnum);

// Create User Request Schema
export const CreateUserRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: UserRoleSchema.optional().default(UserRoleEnum.User),
});

// User Response Schema
export const UserSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Login Request Schema
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Login Response Schema
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});

// Update User Request Schema
export const UpdateUserRequestSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: UserRoleSchema.optional(),
});

// User List Response Schema (paginated)
export const UserListResponseSchema = z.object({
  items: z.array(UserSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// API Response wrapper schema
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    statusCode: z.number().int(),
  });

// Export TypeScript types inferred from Zod schemas
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type User = z.infer<typeof UserSchema>;
// UserRole is the shared enum from types/enums.ts — re-exported here for
// backward compatibility with code that imports it from this module.
export type UserRole = import('../types/enums').UserRole;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;

/**
 * Validates user creation payload
 * @param data - Raw user data
 * @returns Validated user data or throws ZodError
 */
export function validateCreateUserRequest(data: unknown): CreateUserRequest {
  return CreateUserRequestSchema.parse(data);
}

/**
 * Validates login request payload
 * @param data - Raw login data
 * @returns Validated login data or throws ZodError
 */
export function validateLoginRequest(data: unknown): LoginRequest {
  return LoginRequestSchema.parse(data);
}

/**
 * Validates user response from API
 * @param data - Raw API response
 * @returns Validated user object or throws ZodError
 */
export function validateUserResponse(data: unknown): User {
  return UserSchema.parse(data);
}

/**
 * Validates login response from API
 * @param data - Raw API response
 * @returns Validated login response or throws ZodError
 */
export function validateLoginResponse(data: unknown): LoginResponse {
  return LoginResponseSchema.parse(data);
}
