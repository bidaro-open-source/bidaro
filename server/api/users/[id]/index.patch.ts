import { userResource, userService } from '#domains/users'
import { updateUserPolicy } from './index.patch.policy'
import { updateUserRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  mustBeAuthenticated(event)

  const request = await updateUserRequest(event)

  updateUserPolicy(event, request.params.id)

  const updatedUser = await userService.update(
    request.params.id,
    request.body,
  )

  return userResource.make(updatedUser)
})
