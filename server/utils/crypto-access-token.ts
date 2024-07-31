import jwt from 'jsonwebtoken'

export type AccessToken = string

export interface AccessTokenPayload {
  uid: number
}

/**
 * Returns signed access token.
 *
 * @param payload token data
 * @returns assess token
 */
export function createAccessToken(payload: AccessTokenPayload): AccessToken {
  const runtimeConfig = useRuntimeConfig()

  return jwt.sign(
    payload,
    runtimeConfig.jwt.secret,
    { algorithm: 'HS512', expiresIn: runtimeConfig.jwt.accessTTL },
  )
}

/**
 * Returns token verifed status.
 *
 * @param token assess token
 * @returns token verifed or not
 */
export function verifyAccessToken(token: AccessToken): boolean {
  try {
    jwt.verify(token, useRuntimeConfig().jwt.secret)
    return true
  }
  catch (e) {
    return false
  }
}

/**
 * Returns token payload without verification.
 *
 * @param token assess token
 * @returns token data
 */
export function decodeAccessToken(token: AccessToken): AccessTokenPayload {
  return jwt.decode(token) as AccessTokenPayload
}
