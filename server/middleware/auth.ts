import { decodeJWT, verifyJWT } from '../utils/json-web-token'
import { User } from '../database'

export default defineEventHandler(async (event) => {
  event.context.auth = { isAuthenticated: false }

  const authorization = getRequestHeader(event, 'Authorization')

  if (authorization) {
    const token = authorization.split(' ')[1]

    const verifed = verifyJWT(token)

    if (!verifed) {
      throw createError({
        statusCode: 401,
        statusMessage: 'JWT is not verifed',
      })
    }

    const payload = decodeJWT(token)

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