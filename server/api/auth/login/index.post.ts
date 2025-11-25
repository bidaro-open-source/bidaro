import { z } from 'zod'
import { authService } from '~~/server/domains/authentication'
import { createProfileResource, userRepository } from '~~/server/domains/users'
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
    request.body.password,
    user.password,
  )

  if (!passwordsEqual) {
    const issues: z.core.$ZodIssueCustom[] = [{
      code: 'custom',
      path: ['password'],
      message: 'Пароль неправильний',
    }]

    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: z.flattenError(new z.ZodError(issues)),
    })
  }

  const metadata = createRequestMeta(event)

  const session = await authService.createSession(user.id, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    user: createProfileResource(user),
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
  }
})
