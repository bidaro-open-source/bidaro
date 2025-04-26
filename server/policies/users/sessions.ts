import { permissions } from '~/server/constants'

export function getSessionsPolicy(event: H3Event) {
  if (hasPermission(event, permissions.VIEW_OWN_SESSIONS)) {
    return true
  }

  return false
}

export function deleteSessionsPolicy(event: H3Event) {
  if (hasPermission(event, permissions.DELETE_OWN_SESSIONS)) {
    return true
  }

  return false
}
