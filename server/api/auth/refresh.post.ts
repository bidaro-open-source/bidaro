export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'jwt')

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh token not exists!',
    })
  }

  const verifed = verifyJWT(refreshToken)

  if (!verifed) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh token is invalid!',
    })
  }

  const payload = decodeJWT(refreshToken)

  const jwt = encodeJWT(payload.uid)

  setCookie(event, 'jwt', jwt.refresh_token, {
    maxAge: +useRuntimeConfig().jwt.refreshTTL,
    httpOnly: true,
    sameSite: true,
    secure: true,
  })

  return {
    token_type: 'bearer',
    access_token: jwt.access_token,
    refresh_token: jwt.refresh_token,
  }
})
