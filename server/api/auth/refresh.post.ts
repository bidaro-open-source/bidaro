import { refreshRequest } from '~/server/requests/auth/refresh.post'
import {
  updateAuthenticationSession,
  verifyAuthenticationSession,
} from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const request = await validateRequest(event, refreshRequest)

  const verifed = await verifyAuthenticationSession(request.body.refresh_token)

  if (!verifed) {
    throw createError({
      statusCode: 404,
      message: 'Токен оновлення не знайдено',
    })
  }

  const metadata = createRequestMetadata(event)

  const session = await updateAuthenticationSession(
    request.body.refresh_token,
    metadata,
  )

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    token_type: 'bearer',
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
  }
})
