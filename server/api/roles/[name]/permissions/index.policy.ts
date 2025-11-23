import { permissions } from '~~/server/constants'

export const viewRolePermissionsPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.VIEW_ROLE_PERMISSIONS)
})

export const updateRolePermissionsPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.UPDATE_ROLE_PERMISSIONS)
})
