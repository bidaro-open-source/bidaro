import { permissionRepository } from '~~/server/repositories/permission.repository'
import { getPermissionsPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  getPermissionsPolicy(event)

  const permissions = await permissionRepository.findAll()

  return permissions.map(permission => ({
    name: permission.name,
    displayName: permission.displayName,
    description: permission.description,
  }))
})
