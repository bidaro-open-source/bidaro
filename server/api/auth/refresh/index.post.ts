import { userRepository } from '~~/server/repositories/user.repository'
import { createProfileResource } from '~~/server/resources/profile.resource'
import {
  getAuthenticationSession,
  updateAuthenticationSession,
} from '~~/server/services/authentication'
import { refreshRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await refreshRequest(event)

  const oldSession = await getAuthenticationSession(request.body.refresh_token)

  if (!oldSession) {
    deleteRefreshTokenCookie(event)

    throw createError({
      statusCode: 404,
      message: 'Токен оновлення не знайдено',
    })
  }

  const user = await userRepository.findById(oldSession.uid)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувач до якого є доступ не існує',
    })
  }

  const metadata = createRequestMeta(event)

  const session = await updateAuthenticationSession(
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
