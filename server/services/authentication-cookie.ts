import type { H3Event } from 'h3'
import type { RefreshToken } from './authentication'

const COOKIE_REFRESH_TOKEN_NAME = 'jwt'
const COOKIE_REFRESH_TOKEN_BODY_NAME = 'refresh_token'

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
    refreshToken = getCookie(event, COOKIE_REFRESH_TOKEN_NAME)

  if (!refreshToken)
    refreshToken = (await readBody(event))[COOKIE_REFRESH_TOKEN_BODY_NAME]

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
  const runtimeConfig = useRuntimeConfig()
  const refreshTokenTTL = +runtimeConfig.jwt.refreshTTL

  setCookie(event, COOKIE_REFRESH_TOKEN_NAME, refreshToken, {
    maxAge: refreshTokenTTL,
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
  deleteCookie(event, COOKIE_REFRESH_TOKEN_NAME)
}
