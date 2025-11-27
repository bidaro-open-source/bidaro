import { createRoleResource, roleSource } from '#domains/authorization'
import { viewRolesPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  viewRolesPolicy(event)

  const roles = await roleSource.getAll()

  return roles.map(createRoleResource)
})
