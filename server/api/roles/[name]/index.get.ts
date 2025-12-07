import { createRoleResource, roleSource } from '#domains/authorization'
import { viewRolePolicy } from './index.policy'
import { viewRoleRequest } from './index.request'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 40,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await viewRoleRequest(event)

  viewRolePolicy(event)

  const role = await roleSource.getByPk(request.params.name)

  return createRoleResource(role)
})
