import { createRoleResource, roleService } from '#domains/authorization'
import { createRolePolicy } from './index.policy'
import { createRoleRequest } from './index.post.request'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 3,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await createRoleRequest(event)

  createRolePolicy(event)

  const role = await roleService.create(request.body)

  setResponseStatus(event, 201)

  return createRoleResource(role)
})
