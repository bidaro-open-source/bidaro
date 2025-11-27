import { userResource, userService } from '~~/server/domains/users'
import { verifyUserPolicy } from './index.post.policy'
import { verifyUserRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await verifyUserRequest(event)

  verifyUserPolicy(event)

  const user = await userService.verifyEmail(request.params.id)

  return userResource.make(user)
})
