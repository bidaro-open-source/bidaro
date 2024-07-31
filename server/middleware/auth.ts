export default defineEventHandler(async (event) => {
  event.context.auth = { isAuthenticated: false }

  const authorization = getRequestHeader(event, 'Authorization')

  if (authorization) {
    const [type, token] = authorization.split(' ')

    if (type !== 'Bearer') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization method not allowed',
      })
    }

    const verifed = verifyAccessToken(token)

    if (!verifed) {
      throw createError({
        statusCode: 401,
        statusMessage: 'JWT is not verifed',
      })
    }

    const payload = decodeAccessToken(token)

    event.context.auth.uid = payload.uid
    event.context.auth.assessToken = token
    event.context.auth.isAuthenticated = true
  }
})
