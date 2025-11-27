import { userResource, userService } from '#domains/users'
import { updateUserEmailPolicy } from './index.put.policy'
import { updateUserEmailRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateUserEmailRequest(event)

  updateUserEmailPolicy(event, request.params.id)

  const updatedUser = await userService.updateEmail(
    request.params.id,
    request.body.email,
  )

  return userResource.make(updatedUser)
})
