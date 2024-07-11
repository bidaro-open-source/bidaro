import type { RefreshToken } from '../services/authentication'

const REFRESH_TOKEN_COOKIE_NAME = 'jwt'
const REFRESH_TOKEN_BODY_NAME = 'refresh_token'

/**
 * Returns refresh token from cookie or request body.
 *
 * @param event H3Event
 * @returns refresh token or undefined
 */
export async function getRefreshToken(
  event: H3Event,
): Promise<RefreshToken | undefined> {
  let refreshToken

  if (!refreshToken)
    refreshToken = getCookie(event, REFRESH_TOKEN_COOKIE_NAME)

  if (!refreshToken)
    refreshToken = ((await readBody(event) || {}))[REFRESH_TOKEN_BODY_NAME]

  return refreshToken
}

/**
 * Sets refresh token to cookie.
 *
 * @param event H3Event
 * @param refreshToken refresh token
 */
export function setRefreshToken(
  event: H3Event,
  refreshToken: RefreshToken,
): void {
  const ttl = +useRuntimeConfig(event).jwt.refreshTTL

  setCookie(event, REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    maxAge: ttl,
    httpOnly: true,
    sameSite: true,
    secure: true,
  })
}

/**
 * Deletes refresh token in cookie.
 *
 * @param event H3Event
 */
export function deleteRefreshToken(event: H3Event): void {
  deleteCookie(event, REFRESH_TOKEN_COOKIE_NAME)
}
