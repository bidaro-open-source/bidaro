import { createPermissionResource } from '~~/server/resources/permission.resource'
import { roleRepository } from '~~/server/repositories/role.repository'
import { roleService } from '~~/server/services/role.service'
import { updateRolePermissionsPolicy } from './index.policy'
import { updateRolePermissionsRequest } from './index.put.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateRolePermissionsRequest(event)

  updateRolePermissionsPolicy(event)

  await roleService.updatePermissions(
    request.params.name,
    request.body.permissions,
  )

  const permissions = await roleRepository.findAllPermissionsByName(request.params.name)

  return permissions.map(createPermissionResource)
})
