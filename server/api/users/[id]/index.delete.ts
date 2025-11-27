import { userService } from '#domains/users'
import { deleteUserPolicy } from './index.delete.policy'
import { deleteUserRequest } from './index.delete.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteUserRequest(event)

  deleteUserPolicy(event)

  await userService.delete(request.params.id)

  setResponseStatus(event, 204)
})
