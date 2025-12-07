import { userResource, userService } from '#domains/users'
import { verifyUserPolicy } from './index.post.policy'
import { verifyUserRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await verifyUserRequest(event)

  verifyUserPolicy(event)

  const user = await userService.verifyEmail(request.params.id)

  return userResource.make(user)
})
