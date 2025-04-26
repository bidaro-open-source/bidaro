import { updateRolePolicy } from '~/server/policies/roles'
import { updateRoleRequest } from '~/server/requests/roles'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, updateRolePolicy)

  const request = await validateRequest(event, updateRoleRequest)

  const db = useDatabase()

  const role = await db.Role.findByPk(request.params.name)

  if (!role) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    })
  }

  role.displayName = request.body.displayName ?? role.displayName
  role.description = request.body.description ?? role.description

  await role.save()

  return role.toJSON()
})
