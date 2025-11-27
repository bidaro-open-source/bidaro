import { roleService } from '#domains/authorization'
import { deleteRolePolicy } from './index.policy'
import { viewRoleRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 5,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await viewRoleRequest(event)

  deleteRolePolicy(event)

  await roleService.delete(request.params.name)

  setResponseStatus(event, 204)
})
