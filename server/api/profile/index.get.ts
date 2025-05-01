import { fetchUser } from '~/server/services/users-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const userInDB = await fetchUser(user.id)

  if (!userInDB) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувач не існує',
    })
  }

  return {
    user: {
      id: user.id as number,
      email: user.email,
      username: user.username,
    },
    role: user.role
      ? { name: user.role.name }
      : null,
    permissions: user.role
      ? user.role.permissions
        ? user.role.permissions.map(p => ({
            name: p.name,
            displayName: p.displayName,
            description: p.description,
          }))
        : []
      : [],
  }
})
