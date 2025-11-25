import { createUserResource, userService } from '~~/server/modules/users'
import { updateUserPolicy } from './index.patch.policy'
import { updateUserRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateUserRequest(event)

  updateUserPolicy(event, request.params.id)

  const updatedUser = await userService.update(
    request.params.id,
    request.body,
  )

  return createUserResource(updatedUser)
})
