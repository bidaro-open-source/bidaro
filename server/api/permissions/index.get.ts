import { createPermissionResource, permissionSource } from '#domains/authorization'
import { viewPermissionsPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  viewPermissionsPolicy(event)

  const permissions = await permissionSource.getAll()

  return permissions.map(createPermissionResource)
})
