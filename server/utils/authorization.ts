import type { permissions } from '../constants'
import type { Permission } from '../database'

/**
 * Throws an nuxt error if the request is not authorized.
 *
 * @param event H3Event
 * @param policy policy function
 * @param args policy arguments
 * @throws 403 Forbidden
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
 * Checks if the user permissions include the given permission.
 *
 * @param userPermissions user permissions
 * @param permission permission that user must have
 * @returns `true` if the user has the permission
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
