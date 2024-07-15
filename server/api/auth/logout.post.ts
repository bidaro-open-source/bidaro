import { parseRequest } from '~/server/requests/auth/logout.post'
import {
  deleteAuthenticationSession,
  getAuthenticationSession,
} from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const { refresh_token: refreshToken } = await parseRequest(event)

  if (!refreshToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Refresh token not found!',
    })
  }

  const session = await getAuthenticationSession(refreshToken)

  if (!session) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Refresh token not found!',
    })
  }

  if (session.uid !== event.context.auth.uid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Refresh token not found!',
    })
  }

  await deleteAuthenticationSession(session.uid, refreshToken)

  deleteRefreshTokenCookie(event)

  return { ok: true }
})
