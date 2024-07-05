import jwt from 'jsonwebtoken'

export type JsonWebToken = string

export interface JsonWebTokenPayload {
  uid: number
}

export function encodeAccessToken(payload: JsonWebTokenPayload): JsonWebToken {
  const runtimeConfig = useRuntimeConfig()

  return jwt.sign(
    payload,
    runtimeConfig.jwt.secret,
    { algorithm: 'HS512', expiresIn: runtimeConfig.jwt.accessTTL },
  )
}

export function verifyAccessToken(token: JsonWebToken): boolean {
  try {
    jwt.verify(token, useRuntimeConfig().jwt.secret)
    return true
  }
  catch (e) {
    return false
  }
}

export function decodeAccessToken(token: JsonWebToken): JsonWebTokenPayload {
  return jwt.verify(token, useRuntimeConfig().jwt.secret) as JsonWebTokenPayload
}
