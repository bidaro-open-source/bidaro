import { createPermissionResource, createRoleResource, roleSource } from '#domains/authorization'
import { userProfileResource, userSource } from '#domains/users'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 40,
    anonymousLimit: 0,
    duration: 60,
  })

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
