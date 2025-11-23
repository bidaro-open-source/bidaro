import { roleRepository } from '~~/server/repositories/role.repository'
import { createRoleResource } from '~~/server/resources/role.resource'
import { viewRolesPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  viewRolesPolicy(event)

  const roles = await roleRepository.findAll()

  return roles.map(createRoleResource)
})
