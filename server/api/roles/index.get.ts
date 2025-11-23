import { createRoleResource } from '~~/server/resources/role.resource'
import { roleService } from '~~/server/services/role.service'
import { viewRolesPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  viewRolesPolicy(event)

  const roles = await roleService.getAll()

  return roles.map(createRoleResource)
})
