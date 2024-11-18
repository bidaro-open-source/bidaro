import type { Permission } from '../database'

/**
 * Returns true if the authenticated user have some permission from list.
 *
 * Otherwise returns false.
 *
 * @param event H3Event
 * @param permissions permission list that user must have
 */
export default function (
  event: H3Event,
  permissions: string[],
): boolean {
  const user = event.context.auth.user

  if (!user) {
    return false
  }

  if (!user.role) {
    return false
  }

  if (!user.role.permissions) {
    return false
  }

  const userPermissions = user.role.permissions.map(
    (permission: Permission) => permission.name,
  )

  return permissions.some(permission => userPermissions.includes(permission))
}
