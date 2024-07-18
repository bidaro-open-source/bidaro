import { v4 as uuidv4 } from 'uuid'

export type RefreshToken = string
export type SessionToken = string

export interface SessionData {
  accessToken: JsonWebToken
  refreshToken: RefreshToken
  sessionToken: SessionToken
}

export interface SessionMetadata extends RequestMetadata {
  uuid: string
  uid: number
}

export const REDIS_SESSION_NAMESPACE = 'refresh-session'

/**
 * Returns user refresh session by refresh token.
 *
 * @param refreshToken refresh token
 * @returns user session data
 */
export async function getAuthenticationSession(
  refreshToken: RefreshToken,
): Promise<SessionMetadata | null> {
  const redis = useRedis()

  const data = await redis.get(`${REDIS_SESSION_NAMESPACE}:${refreshToken}`)

  return data ? JSON.parse(data) : null
}

/**
 * Checks if the refresh token is whitelisted and still active.
 *
 * @param refreshToken refresh token
 * @returns boolean
 */
export async function verifyAuthenticationSession(
  refreshToken: RefreshToken,
): Promise<boolean> {
  return !!(await useRedis().get(`${REDIS_SESSION_NAMESPACE}:${refreshToken}`))
}

/**
 * Creates a new session for the user that consists of access and refresh
 * tokens.
 *
 * Already adding refresh token to the whitelist.
 *
 * @param uid user id
 * @returns pair of refresh and access tokens
 */
export async function createAuthenticationSession(
  uid: number,
  metadata?: RequestMetadata,
): Promise<SessionData> {
  const redis = useRedis()
  const runtimeConfig = useRuntimeConfig()

  const accessToken = createAccessToken({ uid })
  const refreshToken = uuidv4()
  const sessionToken = uuidv4()
  const refreshTokenTTL = +runtimeConfig.jwt.refreshTTL
  const sessionMetadata = { uid, uuid: sessionToken, ...metadata }

  await redis
    .multi()
    .set(
      `${REDIS_SESSION_NAMESPACE}:${refreshToken}`,
      JSON.stringify(sessionMetadata),
      'EX',
      refreshTokenTTL,
    )
    .sadd(`${REDIS_SESSION_NAMESPACE}:${uid}`, [refreshToken])
    .pexpire(`${REDIS_SESSION_NAMESPACE}:${uid}`, refreshTokenTTL * 1000)
    .exec()

  return {
    accessToken,
    refreshToken,
    sessionToken,
  }
}

/**
 * Updates old authentication session with a new pair of access and refresh
 * tokens.
 *
 * Already updating refresh token to the whitelist.
 *
 * @param refreshToken refresh token
 * @throw if the refresh token is not whitelisted
 * @returns pair of refresh and access tokens
 */
export async function updateAuthenticationSession(
  refreshToken: RefreshToken,
  metadata?: RequestMetadata,
): Promise<SessionData> {
  const redis = useRedis()
  const runtimeConfig = useRuntimeConfig()

  const session = await getAuthenticationSession(refreshToken)

  if (!session)
    throw new Error('Refresh token not found!')

  const uid = session.uid
  const newAccessToken = createAccessToken({ uid })
  const newRefreshToken = uuidv4()
  const newSessionToken = uuidv4()
  const refreshTokenTTL = +runtimeConfig.jwt.refreshTTL

  const sessionMetadata = { uid, uuid: newSessionToken, ...metadata }

  await redis
    .multi()
    .srem(`${REDIS_SESSION_NAMESPACE}:${uid}`, [refreshToken])
    .sadd(`${REDIS_SESSION_NAMESPACE}:${uid}`, [newRefreshToken])
    .pexpire(`${REDIS_SESSION_NAMESPACE}:${uid}`, refreshTokenTTL * 1000)
    .rename(
      `${REDIS_SESSION_NAMESPACE}:${refreshToken}`,
      `${REDIS_SESSION_NAMESPACE}:${newRefreshToken}`,
    )
    .set(
      `${REDIS_SESSION_NAMESPACE}:${newRefreshToken}`,
      JSON.stringify(sessionMetadata),
      'EX',
      refreshTokenTTL,
    )
    .exec()

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: newSessionToken,
  }
}

/**
 * Deletes refresh session from the whitelist.
 *
 * @param uid user id
 * @param refreshToken refresh token
 * @throw if the refresh token is not whitelisted
 */
export async function deleteAuthenticationSession(
  uid: number,
  refreshToken: RefreshToken,
): Promise<void> {
  const redis = useRedis()

  await redis
    .multi()
    .del(`${REDIS_SESSION_NAMESPACE}:${refreshToken}`)
    .srem(`${REDIS_SESSION_NAMESPACE}:${uid}`, [refreshToken])
    .exec()
}
