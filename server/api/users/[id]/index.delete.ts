import { userService } from '#domains/users'
import { deleteUserPolicy } from './index.delete.policy'
import { deleteUserRequest } from './index.delete.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await deleteUserRequest(event)

  deleteUserPolicy(event)

  await userService.delete(request.params.id)

  setResponseStatus(event, 204)
})
