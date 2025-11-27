import { createRoleResource, roleService } from '#domains/authorization'
import { updateRoleRequest } from './index.patch.request'
import { updateRolePolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateRoleRequest(event)

  updateRolePolicy(event)

  const updatedRole = await roleService.update(
    request.params.name,
    request.body,
  )

  return createRoleResource(updatedRole)
})
