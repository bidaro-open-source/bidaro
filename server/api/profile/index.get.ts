import { createPermissionResource } from '~~/server/resources/permission.resource'
import { createProfileResource } from '~~/server/resources/profile.resource'
import { createRoleResource } from '~~/server/resources/role.resource'

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
