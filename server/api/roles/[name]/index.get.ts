import { createRoleResource, roleSource } from '~~/server/domains/authorization'
import { viewRolePolicy } from './index.policy'
import { viewRoleRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await viewRoleRequest(event)

  viewRolePolicy(event)

  const role = await roleSource.getByPk(request.params.name)

  return createRoleResource(role)
})
