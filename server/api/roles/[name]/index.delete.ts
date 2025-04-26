import { roles } from '~/server/constants'
import { deleteRolePolicy } from '~/server/policies/roles'
import { deleteRoleRequest } from '~/server/requests/roles'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, deleteRolePolicy)

  const request = await validateRequest(event, deleteRoleRequest)

  const db = useDatabase()

  for (const role of Object.values(roles)) {
    if (role === request.params.name) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot delete reserved role',
      })
    }
  }

  const role = await db.Role.findByPk(request.params.name)

  if (!role) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    })
  }

  if (request.body.replace) {
    const replacedRole = await db.Role.findByPk(request.body.replace)

    if (!replacedRole) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Role for replace not found',
      })
    }

    await db.User.update(
      {
        roleName: request.body.replace,
      },
      {
        where: {
          roleName: request.params.name,
        },
      },
    )
  }

  return await role.destroy()
})
