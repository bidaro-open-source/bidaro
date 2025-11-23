import { userService } from '~~/server/services/user.service'
import { deleteUserPolicy } from './index.delete.policy'
import { deleteUserRequest } from './index.delete.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteUserRequest(event)

  deleteUserPolicy(event)

  await userService.deleteById(request.params.id)

  setResponseStatus(event, 204)
})
