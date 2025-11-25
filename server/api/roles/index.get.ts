import { createRoleResource } from '~~/server/resources/role.resource'
import { roleSource } from '~~/server/sources/role.source'
import { viewRolesPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  viewRolesPolicy(event)

  const roles = await roleSource.getAll()

  return roles.map(createRoleResource)
})
