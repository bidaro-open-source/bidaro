import { createProfileResource } from '~~/server/resources/profile.resource'
import { fetchUser } from '~~/server/services/users-service'

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

  return createProfileResource(user)
})
