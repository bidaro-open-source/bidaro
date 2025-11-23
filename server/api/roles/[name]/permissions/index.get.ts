import { createPermissionResource } from '~~/server/resources/role.resource'
import { roleRepository } from '~~/server/repositories/role.repository'
import { viewRolePermissionsPolicy } from './index.policy'
import { getRoleRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getRoleRequest(event)

  viewRolePermissionsPolicy(event)

  const permissions = await roleRepository.findAllPermissionsByName(request.params.name)

  return permissions.map(createPermissionResource)
})
