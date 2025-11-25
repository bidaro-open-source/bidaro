import { createPermissionResource } from '~~/server/resources/permission.resource'
import { permissionSource } from '~~/server/sources/permission.source'
import { getPermissionsPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  getPermissionsPolicy(event)

  const permissions = await permissionSource.getAll()

  return permissions.map(createPermissionResource)
})
