import { fetchUser } from '../services/users-service'

/**
 * Checks the request for an access token in the `Authorization` header.
 *
 * If the `Authorization` header is not present, skip the middleware.
 *
 * Otherwise checks:
 * - authorization method is allowed
 * - access token is present, valid and not expired
 * - user exists in the database
 *
 * After checking the request, modifies the request context with the
 * authenticated user data.
 *
 * Context data:
 * - `User` inctance with all attributes
 * - `User` include `Role` association with all attributes
 * - `Role` include `Permission` association with all attributes
 *
 * @throws 401 Unauthorized
 */
export default defineEventHandler(async (event) => {
  const authorization = getRequestHeader(event, 'Authorization')

  if (!authorization)
    return

  const [type, token] = authorization.split(' ')

  if (type !== 'Bearer') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Метод авторизації не дозволений',
    })
  }

  const verifed = verifyAccessToken(token)

  if (!verifed) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Токен авторизації недійсний',
    })
  }

  const payload = decodeAccessToken(token)

  const user = await fetchUser(payload.uid)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Користувач до якого є доступ не існує',
    })
  }

  event.context.auth = { user }
})
