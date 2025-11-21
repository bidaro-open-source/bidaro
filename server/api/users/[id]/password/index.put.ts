import { createUserResource } from '~~/server/resources/user.resource'
import { userService } from '~~/server/services/user.service'
import { updateUserPasswordPolicy } from './index.put.policy'
import { updateUserPasswordRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateUserPasswordRequest(event)

  updateUserPasswordPolicy(event, request.params.id)

  const updatedUser = await userService.updatePassword(
    request.params.id,
    request.body.password,
  )

  return createUserResource(updatedUser)
})
