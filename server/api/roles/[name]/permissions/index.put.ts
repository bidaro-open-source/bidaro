import { createPermissionResource } from '~~/server/resources/role.resource'
import { roleService } from '~~/server/services/role.service'
import { updateRolePermissionsPolicy } from './index.policy'
import { updateRolePermissionsRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateRolePermissionsRequest(event)

  updateRolePermissionsPolicy(event)

  const updatedRole = await roleService.updatePermissions(
    request.params.name,
    request.body.permissions,
  )

  return updatedRole.permissions?.map(createPermissionResource) ?? []
})
