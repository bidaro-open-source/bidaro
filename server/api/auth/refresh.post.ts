import { refreshRequest } from '~/server/requests/auth/refresh.post'
import { createProfileResource } from '~/server/resources/profile-resource'
import {
  getAuthenticationSession,
  updateAuthenticationSession,
} from '~/server/services/authentication'
import { fetchUser } from '~/server/services/users-service'

export default defineEventHandler(async (event) => {
  const request = await validateRequest(event, refreshRequest)

  const oldSession = await getAuthenticationSession(request.body.refresh_token)

  if (!oldSession) {
    deleteRefreshTokenCookie(event)

    throw createError({
      statusCode: 404,
      message: 'Токен оновлення не знайдено',
    })
  }

  const user = await fetchUser(oldSession.uid)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувач до якого є доступ не існує',
    })
  }

  const metadata = createRequestMetadata(event)

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
