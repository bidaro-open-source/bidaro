import { userResource, userService } from '#domains/users'
import { actionLimits } from '~~/server/constants'
import { updateUserPasswordPolicy } from './index.put.policy'
import { updateUserPasswordRequest } from './index.put.request'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await updateUserPasswordRequest(event)

  updateUserPasswordPolicy(event, request.params.id)

  const updatedUser = await useActionLimiter(event, 'update_password', actionLimits.UPDATE_PASSWORD, async () => {
    return await userService.updatePassword(
      request.params.id,
      request.body.password,
    )
  })

  return userResource.make(updatedUser)
})
