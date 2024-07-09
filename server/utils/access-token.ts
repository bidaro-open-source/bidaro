import jwt from 'jsonwebtoken'

export type JsonWebToken = string

export interface JsonWebTokenPayload {
  uid: number
}

/**
 * Returns signed access token.
 *
 * @param payload token data
 * @returns json web token
 */
export function createAccessToken(payload: JsonWebTokenPayload): JsonWebToken {
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
 * @param token json web token
 * @returns token verifed or not
 */
export function verifyAccessToken(token: JsonWebToken): boolean {
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
 * @param token json web token
 * @returns token data
 */
export function decodeAccessToken(token: JsonWebToken): JsonWebTokenPayload {
  return jwt.decode(token) as JsonWebTokenPayload
}
