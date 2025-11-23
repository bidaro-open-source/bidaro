import { permissionRepository } from '~~/server/repositories/permission.repository'
import { createPermissionResource } from '~~/server/resources/permission.resource'
import { getPermissionsPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  getPermissionsPolicy(event)

  const permissions = await permissionRepository.findAll()

  return permissions.map(createPermissionResource)
})
