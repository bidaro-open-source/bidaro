import { createPermissionResource, roleRepository, roleService } from '#domains/authorization'
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

  const permissions = await roleRepository.findAllPermissionsByPk(request.params.name)

  return permissions.map(createPermissionResource)
})
