import { userResource, userService } from '#domains/users'
import { updateUserEmailPolicy } from './index.put.policy'
import { updateUserEmailRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await updateUserEmailRequest(event)

  updateUserEmailPolicy(event, request.params.id)

  const updatedUser = await useActionLimiter(event, 'update_email', actionLimits.UPDATE_EMAIL, async () => {
    return await userService.updateEmail(
      request.params.id,
      request.body.email,
    )
  })

  return userResource.make(updatedUser)
})
