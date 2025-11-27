import { authService } from '../domains/authentication'
import { userSource } from '../domains/users'

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

  const verifed = authService.verifyAccessToken(token)

  if (!verifed) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Токен авторизації недійсний',
    })
  }

  const payload = authService.decodeAccessToken(token)

  const user = await userSource.getByPkWithAuth(payload.uid)

  event.context.auth = { user }
})
