import { createPermissionResource, createRoleResource, roleSource } from '~~/server/domains/authorization'
import { userProfileResource, userSource } from '~~/server/domains/users'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const uid = getAuthenticatedUser(event).id

  const user = await userSource.getByPk(uid)

  const [role, permissions] = await Promise.all([
    user.roleName ? roleSource.getByPk(user.roleName) : Promise.resolve(undefined),
    user.roleName ? roleSource.getPermissionsByPk(user.roleName) : Promise.resolve(undefined),
  ])

  return {
    ...userProfileResource.make(user),
    role: role ? createRoleResource(role) : null,
    permissions: (permissions || []).map(createPermissionResource),
  }
})
