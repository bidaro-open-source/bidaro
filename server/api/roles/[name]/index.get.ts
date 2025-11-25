import { createRoleResource } from '~~/server/resources/role.resource'
import { roleSource } from '~~/server/sources/role.source'
import { viewRolePolicy } from './index.policy'
import { getRoleRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getRoleRequest(event)

  viewRolePolicy(event)

  const role = await roleSource.getByName(request.params.name)

  return createRoleResource(role)
})
