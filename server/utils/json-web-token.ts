import jwt from 'jsonwebtoken'

export interface JsonWebToken {
  access_token: string
  refresh_token: string
}

export interface JsonWebTokenPayload {
  uid: number
  iat: number
  exp: number
}

export function encodeJWT(uid: number): JsonWebToken {
  const runtimeConfig = useRuntimeConfig()

  const exp = Math.floor(Date.now() / 1000)
  const access_token_exp = exp + runtimeConfig.jwt.accessTTL
  const refresh_token_exp = exp + runtimeConfig.jwt.refreshTTL

  const access_token = jwt.sign(
    { uid, exp: access_token_exp },
    runtimeConfig.jwt.secret,
    { algorithm: 'HS384' },
  )

  const refresh_token = jwt.sign(
    { uid, exp: refresh_token_exp },
    runtimeConfig.jwt.secret,
    { algorithm: 'HS512' },
  )

  return {
    access_token,
    refresh_token,
  }
}

export function verifyJWT(token: string): boolean {
  try {
    jwt.verify(token, useRuntimeConfig().jwt.secret)
    return true
  }
  catch (e) {
    return false
  }
}

export function decodeJWT(token: string): JsonWebTokenPayload {
  return jwt.verify(token, useRuntimeConfig().jwt.secret) as JsonWebTokenPayload
}
