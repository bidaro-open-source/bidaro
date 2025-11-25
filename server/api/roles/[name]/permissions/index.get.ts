import { createPermissionResource, roleSource } from '~~/server/domains/authorization'
import { getRoleRequest } from '../index.request'
import { viewRolePermissionsPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getRoleRequest(event)

  viewRolePermissionsPolicy(event)

  const role = await roleSource.getByPk(request.params.name)

  const permissions = await roleSource.getPermissionsByPk(role.name)

  return permissions.map(createPermissionResource)
})
