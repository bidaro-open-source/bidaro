import { getPermissionsPolicy } from '~/server/policies/permissions'
import { getPermissionRequest } from '~/server/requests/permissions'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, getPermissionsPolicy)

  const request = await validateRequest(event, getPermissionRequest)

  const db = useDatabase()

  const permission = await db.Permission.findByPk(request.params.id, {
    include: {
      model: db.Role,
      through: { attributes: [] },
      as: 'roles',
    },
  })

  if (!permission || !permission.roles) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Permission not found',
    })
  }

  return permission.roles
})
