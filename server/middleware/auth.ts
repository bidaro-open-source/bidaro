import { User } from '../database'

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

    const user = await User.findByPk(payload.uid)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found!',
      })
    }

    event.context.auth.user = user
    event.context.auth.isAuthenticated = true
  }
})
