import { createPermissionResource, roleSource } from '#domains/authorization'
import { viewRoleRequest } from '../index.request'
import { viewRolePermissionsPolicy } from './index.policy'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 40,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await viewRoleRequest(event)

  viewRolePermissionsPolicy(event)

  const role = await roleSource.getByPk(request.params.name)

  const permissions = await roleSource.getPermissionsByPk(role.name)

  return permissions.map(createPermissionResource)
})
