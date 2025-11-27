import { createPermissionResource, roleSource } from '#domains/authorization'
import { viewRoleRequest } from '../index.request'
import { viewRolePermissionsPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await viewRoleRequest(event)

  viewRolePermissionsPolicy(event)

  const role = await roleSource.getByPk(request.params.name)

  const permissions = await roleSource.getPermissionsByPk(role.name)

  return permissions.map(createPermissionResource)
})
