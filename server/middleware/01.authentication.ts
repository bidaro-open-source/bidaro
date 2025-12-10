import { authService } from '#domains/authentication'
import { userSource } from '#domains/users'

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
 * @throws INVALID_AUTHORIZATION_METHOD
 * @throws INVALID_ACCESS_TOKEN
 * @throws USER_NOT_FOUND
 */
export default defineEventHandler(async (event) => {
  const authorization = getRequestHeader(event, 'Authorization')

  if (!authorization)
    return

  const [type, token] = authorization.split(' ')

  if (type !== 'Bearer') {
    throw createAppError('INVALID_AUTHORIZATION_METHOD')
  }

  const verifed = authService.verifyAccessToken(token)

  if (!verifed) {
    throw createAppError('INVALID_ACCESS_TOKEN')
  }

  const payload = authService.decodeAccessToken(token)

  const user = await userSource.getByPkWithAuth(payload.uid)

  event.context.auth = { user }
})
