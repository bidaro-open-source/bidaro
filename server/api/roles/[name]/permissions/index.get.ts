import { createPermissionResource } from '~~/server/resources/permission.resource'
import { roleSource } from '~~/server/sources/role.source'
import { getRoleRequest } from '../index.request'
import { viewRolePermissionsPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getRoleRequest(event)

  viewRolePermissionsPolicy(event)

  const role = await roleSource.getByName(request.params.name)

  const permissions = await roleSource.getPermissionsByName(role.name)

  return permissions.map(createPermissionResource)
})
