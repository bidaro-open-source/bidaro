import { parseRequest } from '~/server/requests/auth/refresh.post'
import {
  updateAuthenticationSession,
  verifyAuthenticationSession,
} from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const { refresh_token: refreshToken } = await parseRequest(event)

  const verifed = await verifyAuthenticationSession(refreshToken)

  if (!verifed) {
    throw createError({
      statusCode: 404,
      message: 'Токен оновлення не знайдено',
    })
  }

  const metadata = createRequestMetadata(event)

  const session = await updateAuthenticationSession(refreshToken, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    token_type: 'bearer',
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_token: session.sessionToken,
  }
})
