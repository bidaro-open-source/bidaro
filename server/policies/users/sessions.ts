import { permissions } from '~/server/constants'

export function getSessionsPolicy(event: H3Event, uid: number) {
  if (event.context.auth.uid === uid
    && hasPermission(event, permissions.VIEW_OWN_SESSIONS)) {
    return true
  }

  if (hasPermission(event, permissions.VIEW_ALL_SESSIONS)) {
    return true
  }

  return false
}

export function deleteSessionsPolicy(event: H3Event, uid: number) {
  if (event.context.auth.uid === uid
    && hasPermission(event, permissions.DELETE_OWN_SESSIONS)) {
    return true
  }

  if (hasPermission(event, permissions.DELETE_ALL_SESSIONS)) {
    return true
  }

  return false
}
