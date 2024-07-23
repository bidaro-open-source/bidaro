import { v4 as uuidv4 } from 'uuid'

export type SessionUUID = string

export interface SessionData {
  uuid: SessionUUID
  accessToken: AccessToken
  refreshToken: RefreshToken
}

export interface SessionMetadata extends RequestMetadata {
  uuid: SessionUUID
  uid: number
}

export interface SessionMetadataCollection {
  [key: RefreshToken]: SessionMetadata
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
 * Returns user sessions. When gets session metadata, clear
 * old tokens, which not exists.
 *
 * @param uid user id
 * @returns array of user session data
 */
export async function getAuthenticationSessions(
  uid: number,
): Promise<SessionMetadataCollection> {
  const redis = useRedis()

  const tokens = await redis.smembers(`${REDIS_SESSION_NAMESPACE}:${uid}`)
  const sessions: SessionMetadataCollection = {}
  const inactiveSessions: SessionUUID[] = []

  if (tokens.length) {
    const allSessions = await redis.mget(
      tokens.map(token => `${REDIS_SESSION_NAMESPACE}:${token}`),
    )

    for (let i = 0; i < tokens.length; i++) {
      const currectToken = tokens[i]
      const currectSession = allSessions[i]

      currectSession !== null
        ? sessions[currectToken] = JSON.parse(currectSession)
        : inactiveSessions.push(currectToken)
    }
  }

  if (inactiveSessions.length) {
    await redis.srem(`${REDIS_SESSION_NAMESPACE}:${uid}`, inactiveSessions)
  }

  return sessions
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

  const uuid = uuidv4()
  const accessToken = createAccessToken({ uid })
  const refreshToken = createRefreshToken()
  const refreshTokenTTL = +runtimeConfig.jwt.refreshTTL
  const sessionMetadata = { uid, uuid, ...metadata }

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
    uuid,
    accessToken,
    refreshToken,
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
  const uuid = uuidv4()
  const newAccessToken = createAccessToken({ uid })
  const newRefreshToken = createRefreshToken()
  const refreshTokenTTL = +runtimeConfig.jwt.refreshTTL

  const sessionMetadata = { uid, uuid, ...metadata }

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
    uuid,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
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
