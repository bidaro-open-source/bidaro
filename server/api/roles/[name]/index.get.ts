import { createRoleResource, roleSource } from '~~/server/domains/authorization'
import { viewRolePolicy } from './index.policy'
import { getRoleRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getRoleRequest(event)

  viewRolePolicy(event)

  const role = await roleSource.getByPk(request.params.name)

  return createRoleResource(role)
})
