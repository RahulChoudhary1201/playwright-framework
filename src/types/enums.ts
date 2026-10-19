/**
 * Framework-wide enums
 *
 * Central place for every fixed set of values used across the
 * framework. Using real enums (not string-union types) gives:
 *   - Runtime values usable in switch/if without magic strings
 *   - IDE autocomplete on the enum members
 *   - A single source of truth shared by types, DTOs and tests
 */

/**
 * Roles a user can have in the system.
 * Mirrors UserRoleSchema in dtos/user.dto.ts — keep the two in sync.
 */
export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Moderator = 'moderator',
  Guest = 'guest',
}

/**
 * Direction for sortable/paginated queries.
 */
export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

/**
 * A sortable field paired with its direction.
 */
export interface SortOrder {
  field: string;
  direction: SortDirection;
}