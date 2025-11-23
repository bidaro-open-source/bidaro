import { roleRepository } from '~~/server/repositories/role.repository'
import { createPermissionResource } from '~~/server/resources/permission.resource'
import { getRoleRequest } from '../index.request'
import { viewRolePermissionsPolicy } from './index.policy'

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

  return (role.permissions || []).map(createPermissionResource)
})
