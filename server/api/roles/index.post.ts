import { createRolePolicy } from '~/server/policies/roles'
import { createRoleRequest } from '~/server/requests/roles'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, createRolePolicy)

  const request = await validateRequest(event, createRoleRequest)

  const db = useDatabase()

  const role = await db.Role.findByPk(request.body.name)

  if (role) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Role already exists',
    })
  }

  const newRole = await db.Role.create({
    name: request.body.name,
    displayName: request.body.displayName,
    description: request.body.description,
  })

  return newRole
})
