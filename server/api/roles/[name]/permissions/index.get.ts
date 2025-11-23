import { createPermissionResource } from '~~/server/resources/permission.resource'
import { roleRepository } from '~~/server/repositories/role.repository'
import { viewRolePermissionsPolicy } from './index.policy'
import { getRoleRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getRoleRequest(event)

  viewRolePermissionsPolicy(event)

  const role = await roleRepository.findByName(request.params.name)

  if (!role) {
    throw createError({
      statusCode: 404,
      message: 'Роль не знайдено',
    })
  }

  const permissions = await roleRepository.findAllPermissionsByName(request.params.name)

  return permissions.map(createPermissionResource)
})
