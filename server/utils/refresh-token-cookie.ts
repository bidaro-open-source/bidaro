import type { RefreshToken } from '../services/authentication'

export const REFRESH_TOKEN_COOKIE_NAME = 'jwt'
export const REFRESH_TOKEN_BODY_NAME = 'refresh_token'

/**
 * Returns refresh token from cookie or request body.
 *
 * @param event H3Event
 * @returns refresh token or undefined
 */
export function getRefreshTokenCookie(
  event: H3Event,
): RefreshToken | undefined {
  return getCookie(event, REFRESH_TOKEN_COOKIE_NAME)
}

/**
 * Sets refresh token to cookie.
 *
 * @param event H3Event
 * @param refreshToken refresh token
 */
export function setRefreshTokenCookie(
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
export function deleteRefreshTokenCookie(event: H3Event): void {
  deleteCookie(event, REFRESH_TOKEN_COOKIE_NAME)
}
