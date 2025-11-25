import { createPermissionResource, createRoleResource } from '~~/server/modules/authorization'
import { createProfileResource } from '~~/server/modules/users'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)
  const role = getAuthenticatedUserRole(event)
  const permissions = getAuthenticatedUserPermissions(event)

  return {
    ...createProfileResource(user),
    role: role ? createRoleResource(role) : null,
    permissions: (permissions || []).map(createPermissionResource),
  }
})
