import type { Permission } from '../database'

/**
 * Returns true if the authenticated user have permission.
 *
 * Otherwise returns false.
 *
 * @param event H3Event
 * @param permission permission that user must have
 */
export default function (
  event: H3Event,
  permission: string,
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
    (permissionItem: Permission) => permissionItem.name,
  )

  return userPermissions.includes(permission)
}
