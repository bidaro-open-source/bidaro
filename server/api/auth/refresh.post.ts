import {
  updateAuthenticationSession,
  verifyAuthenticationSession,
} from '~/server/services/authentication'
import {
  getRefreshToken,
  setRefreshToken,
} from '~/server/services/authentication-cookie'

export default defineEventHandler(async (event) => {
  const refreshToken = await getRefreshToken(event)

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

  const session = await updateAuthenticationSession(refreshToken, {
    ip: getRequestIP(event),
    ua: getRequestHeader(event, 'user-agent'),
  })

  setRefreshToken(event, session.refreshToken)

  return {
    token_type: 'bearer',
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  }
})
