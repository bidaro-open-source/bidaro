import { deleteAuthenticationSession } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const refreshToken = await getRefreshToken(event)

  if (!refreshToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Refresh token not found!',
    })
  }

  await deleteAuthenticationSession(refreshToken)

  deleteRefreshToken(event)

  return { ok: true }
})
