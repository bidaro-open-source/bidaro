import { parseRequest } from '~/server/requests/auth/refresh.post'
import {
  updateAuthenticationSession,
  verifyAuthenticationSession,
} from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const { refresh_token: refreshToken } = await parseRequest(event)

  if (!refreshToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Refresh token not found!',
    })
  }

  const verifed = await verifyAuthenticationSession(refreshToken)

  if (!verifed) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh token is invalid!',
    })
  }

  const metadata = createRequestMetadata(event)

  const session = await updateAuthenticationSession(refreshToken, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    token_type: 'bearer',
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  }
})
