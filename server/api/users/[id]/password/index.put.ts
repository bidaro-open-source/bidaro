import { userResource, userService } from '#domains/users'
import { updateUserPasswordPolicy } from './index.put.policy'
import { updateUserPasswordRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await updateUserPasswordRequest(event)

  updateUserPasswordPolicy(event, request.params.id)

  const updatedUser = await userService.updatePassword(
    request.params.id,
    request.body.password,
  )

  return userResource.make(updatedUser)
})
