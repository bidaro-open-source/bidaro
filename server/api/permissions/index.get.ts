import { createPermissionResource, permissionSource } from '~~/server/domains/authorization'
import { getPermissionsPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  getPermissionsPolicy(event)

  const permissions = await permissionSource.getAll()

  return permissions.map(createPermissionResource)
})
