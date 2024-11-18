import { getRolesPolicy } from '~/server/policies/roles'
import { getRoleRequest } from '~/server/requests/roles'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, getRolesPolicy)

  const request = await validateRequest(event, getRoleRequest)

  const db = useDatabase()

  const role = await db.Role.findByPk(request.params.id)

  if (!role) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    })
  }

  return role
})
