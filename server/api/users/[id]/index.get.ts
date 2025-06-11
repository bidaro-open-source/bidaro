import { userRepository } from '~~/server/repositories/user.repository'
import { getUserRequest } from '~~/server/requests/user.request'
import { createUserResource } from '~~/server/resources/user.resource'

export default defineEventHandler(async (event) => {
  const request = await getUserRequest(event)

  const user = await userRepository.findById(request.params.id)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувача не знайдено',
    })
  }

  return createUserResource(user)
})
