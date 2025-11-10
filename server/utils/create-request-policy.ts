import type { permissions } from '../constants'
import type { Permission } from '../database'

/**
 * Creates a request policy function.
 *
 * @param policy - policy function
 * @throws 403 error for policy failures
 * @throws 500 error for unexpected errors
 *
 * @example
 * const policy = createRequestPolicy((event: H3Event, key: string) => key === 'hello world')
 *
 * policy(event, 'hello world') // ok
 * policy(event, 'no') // throws an 403 error
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
      throw createError({
        statusCode: 500,
        statusMessage: 'Unprocessable Content',
        message: 'Невідома помилка під час авторизації запиту',
        data: error,
      })
    }

    if (!result) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Немає доступу',
      })
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
