import { userResource, userService } from '#domains/users'
import { updateUserRolePolicy } from './index.put.policy'
import { updateUserRoleRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateUserRoleRequest(event)

  updateUserRolePolicy(event)

  const user = await userService.updateRole(
    request.params.id,
    request.body.roleName,
  )

  return userResource.make(user)
})
