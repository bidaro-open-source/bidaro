import { createUserResource } from '~~/server/resources/user.resource'
import { userService } from '~~/server/services/user.service'
import { updateUserRolePolicy } from './index.put.policy'
import { updateUserRoleRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateUserRoleRequest(event)

  updateUserRolePolicy(event)

  const user = await userService.updateRole(request.params.id, request.body.roleName)

  return createUserResource(user)
})
