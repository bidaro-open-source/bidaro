import { z } from 'zod'
import { userRepository } from '~~/server/repositories/user.repository'
import { createProfileResource } from '~~/server/resources/profile.resource'
import { createAuthenticationSession } from '~~/server/services/authentication'
import { loginRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await loginRequest(event)

  const user = await userRepository.findByUsername(request.body.username)

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'Аккаунт не знайдено',
    })
  }

  const passwordsEqual = await comparePassword(
    event,
    request.body.password,
    user.password,
  )

  if (!passwordsEqual) {
    const issues: z.ZodIssue[] = [{
      code: 'custom',
      path: ['password'],
      message: 'Пароль неправильний',
    }]

    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: new z.ZodError(issues).flatten(),
    })
  }

  const metadata = createRequestMetadata(event)

  const session = await createAuthenticationSession(user.id, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    user: createProfileResource(user),
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
  }
})
