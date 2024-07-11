import {
  deleteAuthenticationSession,
  getAuthenticationSession,
} from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const refreshToken = await getRefreshToken(event)

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

  await deleteAuthenticationSession(session.uid, refreshToken)

  deleteRefreshToken(event)

  return { ok: true }
})
