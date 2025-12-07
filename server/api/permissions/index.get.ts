import { createPermissionResource, permissionSource } from '#domains/authorization'
import { viewPermissionsPolicy } from './index.get.policy'

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

  viewPermissionsPolicy(event)

  const permissions = await permissionSource.getAll()

  return permissions.map(createPermissionResource)
})
