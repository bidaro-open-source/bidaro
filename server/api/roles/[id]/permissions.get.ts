import { getRolesPolicy } from '~/server/policies/roles'
import { getRoleRequest } from '~/server/requests/roles'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, getRolesPolicy)

  const request = await validateRequest(event, getRoleRequest)

  const db = useDatabase()

  const role = await db.Role.findByPk(request.params.id, {
    include: {
      model: db.Permission,
      through: { attributes: [] },
      as: 'permissions',
    },
  })

  if (!role || !role.permissions) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    })
  }

  return role.permissions
})
