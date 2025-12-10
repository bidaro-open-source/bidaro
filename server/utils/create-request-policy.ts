import type { permissions } from '../constants'

/**
 * Creates a request policy function.
 *
 * @param policy - policy function
 * @throws FORBIDDEN - When policy check fails
 *
 * @example
 * const policy = createRequestPolicy((event: H3Event, key: string) => key === 'hello world')
 *
 * policy(event, 'hello world') // ok
 * policy(event, 'no') // throws FORBIDDEN error
 */
export function createRequestPolicy<Policy extends (...args: any[]) => any>(
  policy: Policy,
) {
  return (...args: Parameters<Policy> extends [...infer P] ? P : never) => {
    let result = false

    try {
      result = policy(...args)
    }
    catch (error) {
      logger.crit('Unknown error during request policy execution', error)
      throw createAppError('INTERNAL_SERVER_ERROR')
    }

    if (!result) {
      throw createAppError('FORBIDDEN')
    }
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
  userPermissions: string[],
  permission: typeof permissions[keyof typeof permissions],
): boolean {
  for (const userPermission of userPermissions) {
    if (userPermission === permission) {
      return true
    }
  }

  return false
}
