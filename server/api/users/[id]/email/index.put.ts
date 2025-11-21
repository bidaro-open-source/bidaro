import { createUserResource } from '~~/server/resources/user.resource'
import { userService } from '~~/server/services/user.service'
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

  return createUserResource(updatedUser)
})
