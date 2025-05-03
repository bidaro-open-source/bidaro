import jwt from 'jsonwebtoken'

/**
 * Defines the structure of the access token.
 */
export type AccessToken = string

/**
 * Defines the structure of the payload for the access token.
 */
export interface AccessTokenPayload {
  uid: number
}

/**
 * Creates and signs a new JWT access token with the provided payload.
 *
 * @param payload token data
 * @returns signed access token string
 */
export function createAccessToken(payload: AccessTokenPayload): AccessToken {
  const runtimeConfig = useRuntimeConfig()

  return jwt.sign(
    payload,
    runtimeConfig.jwt.secret,
    { algorithm: 'HS512', expiresIn: +runtimeConfig.jwt.accessTTL },
  )
}

/**
 * Verifies if the provided access token is valid and not expired.
 *
 * @param token token access token string to verify
 * @returns true if token is valid, false otherwise
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
 * Returns token payload without verification. Decodes the JWT access token
 * and extracts the payload data containing user information.
 *
 * Please, verify the token before using this function.
 *
 * @param token access token string to decode
 * @returns decoded token payload containing user data
 */
export function decodeAccessToken(token: AccessToken): AccessTokenPayload {
  return jwt.decode(token) as AccessTokenPayload
}
