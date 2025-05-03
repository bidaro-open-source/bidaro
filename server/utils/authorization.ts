import type { permissions } from '../constants'
import type { Permission } from '../database'

/**
 * Enforces authorization by validating against a policy function.
 *
 * Throws a 403 Forbidden error if the policy check fails.
 *
 * @param event H3Event
 * @param policy authorization policy function to evaluate
 * @param args additional arguments passed to the policy function
 * @throws 403 Forbidden
 *
 * @example
 * // Policy function that checks if user can access a resource
 * const canAccessPolicy = (_: H3Event, val: string) => val === "value"
 * // Usage in route handler
 * mustBeAuthorized(event, canAccessPolicy, "value")
 * // Continues if authorized
 */
export function mustBeAuthorized<Policy extends (...args: any[]) => any>(
  event: H3Event,
  policy: Policy,
  ...args: Parameters<Policy> extends [H3Event, ...infer P] ? P : never
): void {
  if (!policy(event, ...args)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Немає доступу',
    })
  }
}

/**
 * Checks if a user has a specific permission by comparing against their
 * assigned permissions.
 *
 * @param userPermissions array of user's assigned permissions
 * @param permission single permission to check for
 * @returns true if user has the specified permission, false otherwise
 *
 * @example
 * const userPerms = [{ name: 'READ_POSTS' }];
 * const canRead = hasPermission(userPerms, 'READ_POSTS'); // returns true
 * const canDelete = hasPermission(userPerms, 'DELETE_POSTS'); // returns false
 */
export function hasPermission(
  userPermissions: Permission[],
  permission: typeof permissions[keyof typeof permissions],
): boolean {
  for (const userPermission of userPermissions) {
    if (userPermission.name === permission) {
      return true
    }
  }

  return false
}
