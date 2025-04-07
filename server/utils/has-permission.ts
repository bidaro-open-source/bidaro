import type { permissions } from '../constants'

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
  permission: typeof permissions[keyof typeof permissions],
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

  for (const userPermission of user.role.permissions) {
    if (userPermission.name === permission) {
      return true
    }
  }

  return false
}
