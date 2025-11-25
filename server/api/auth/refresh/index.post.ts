import { authService } from '~~/server/domains/authentication'
import { createProfileResource, userRepository } from '~~/server/domains/users'
import { refreshRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await refreshRequest(event)

  const oldSession = await authService.getSession(request.body.refresh_token)

  if (!oldSession) {
    deleteRefreshTokenCookie(event)

    throw createError({
      statusCode: 404,
      message: 'Токен оновлення не знайдено',
    })
  }

  const user = await userRepository.findByPk(oldSession.uid)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувач до якого є доступ не існує',
    })
  }

  const metadata = createRequestMeta(event)

  const session = await authService.updateSession(
    request.body.refresh_token,
    metadata,
  )

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    user: createProfileResource(user),
    token_type: 'bearer',
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
  }
})
