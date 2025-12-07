import { userResource, userSource } from '#domains/users'
import { viewUserRequest } from './index.request'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 200,
    duration: 60,
  })

  const request = await viewUserRequest(event)

  const user = await userSource.getByPk(request.params.id)

  return userResource.make(user)
})
