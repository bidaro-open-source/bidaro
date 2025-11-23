import { createPermissionResource } from '~~/server/resources/role.resource'
import { roleService } from '~~/server/services/role.service'
import { viewRolePermissionsPolicy } from './index.policy'
import { getRoleRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getRoleRequest(event)

  viewRolePermissionsPolicy(event)

  const role = await roleService.getByName(request.params.name)

  return role.permissions?.map(createPermissionResource) ?? []
})
