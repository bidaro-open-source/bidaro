import { createRoleResource } from '~~/server/resources/role.resource'
import { roleService } from '~~/server/services/role.service'
import { updateRolePolicy } from './index.policy'
import { updateRoleRequest } from './index.patch.request'

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
