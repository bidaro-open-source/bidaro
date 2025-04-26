import { assignPermissionPolicy } from '~/server/policies/roles'
import { updateRolePermissionRequest } from '~/server/requests/roles'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, assignPermissionPolicy)

  const request = await validateRequest(event, updateRolePermissionRequest)

  const db = useDatabase()

  const role = await db.Role.findByPk(request.params.name)

  if (!role) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    })
  }

  await role.setPermissions(request.body.permissions)

  return (await role.getPermissions({
    attributes: ['name', 'displayName', 'description'],
    // @ts-expect-error sequelize does not support this type
    joinTableAttributes: [],
  }))
})
