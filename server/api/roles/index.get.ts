import { createRoleResource, roleSource } from '~~/server/modules/authorization'
import { viewRolesPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  viewRolesPolicy(event)

  const roles = await roleSource.getAll()

  return roles.map(createRoleResource)
})
