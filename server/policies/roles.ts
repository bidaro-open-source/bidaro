import { permissions } from '~/server/constants'

export function getRolesPolicy(event: H3Event) {
  return hasPermission(event, permissions.VIEW_ALL_ROLES)
}

export function createRolePolicy(event: H3Event) {
  return hasPermission(event, permissions.CREATE_ROLE)
}

export function updateRolePolicy(event: H3Event) {
  return hasPermission(event, permissions.UPDATE_ROLE)
}

export function deleteRolePolicy(event: H3Event) {
  return hasPermission(event, permissions.DELETE_ROLE)
}

export function assignPermissionPolicy(event: H3Event) {
  return hasPermission(event, permissions.ASSIGN_PERMISSION)
}
