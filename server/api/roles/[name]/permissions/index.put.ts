import { createPermissionResource, roleRepository, roleService } from '#domains/authorization'
import { updateRolePermissionsPolicy } from './index.policy'
import { updateRolePermissionsRequest } from './index.put.request'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await updateRolePermissionsRequest(event)

  updateRolePermissionsPolicy(event)

  await roleService.updatePermissions(
    request.params.name,
    request.body.permissions,
  )

  const permissions = await roleRepository.findAllPermissionsByPk(request.params.name)

  return permissions.map(createPermissionResource)
})
