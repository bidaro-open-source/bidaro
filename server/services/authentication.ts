import { v4 as uuidv4 } from 'uuid'

export type RefreshToken = string

export interface TokensPair {
  accessToken: JsonWebToken
  refreshToken: RefreshToken
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
  const data = await useRedis()
    .get(`${REDIS_SESSION_NAMESPACE}:${refreshToken}`)

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
): Promise<TokensPair> {
  const redis = useRedis()
  const runtimeConfig = useRuntimeConfig()

  const accessToken = createAccessToken({ uid })
  const refreshToken = uuidv4()
  const refreshTokenTTL = +runtimeConfig.jwt.refreshTTL
  const sessionMetadata = { uid, uuid: uuidv4(), ...metadata }

  await redis.set(
    `${REDIS_SESSION_NAMESPACE}:${refreshToken}`,
    JSON.stringify(sessionMetadata),
    'EX',
    refreshTokenTTL,
  )

  await redis.sadd(`${REDIS_SESSION_NAMESPACE}:${uid}`, [refreshToken])

  return {
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
): Promise<TokensPair> {
  const redis = useRedis()
  const runtimeConfig = useRuntimeConfig()

  const session = await getAuthenticationSession(refreshToken)

  if (!session)
    throw new Error('Refresh token not found!')

  const uid = session.uid
  const newAccessToken = createAccessToken({ uid })
  const newRefreshToken = uuidv4()
  const refreshTokenTTL = +runtimeConfig.jwt.refreshTTL

  const sessionMetadata = { uid, uuid: uuidv4(), ...metadata }

  await redis.srem(`${REDIS_SESSION_NAMESPACE}:${uid}`, [refreshToken])

  await redis.sadd(`${REDIS_SESSION_NAMESPACE}:${uid}`, [newRefreshToken])

  await redis.rename(
    `${REDIS_SESSION_NAMESPACE}:${refreshToken}`,
    `${REDIS_SESSION_NAMESPACE}:${newRefreshToken}`,
  )

  await redis.set(
    `${REDIS_SESSION_NAMESPACE}:${newRefreshToken}`,
    JSON.stringify(sessionMetadata),
    'EX',
    refreshTokenTTL,
  )

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

/**
 * Deletes refresh session from the whitelist and cookie.
 *
 * @param refreshToken refresh token
 * @throw if the refresh token is not whitelisted
 */
export async function deleteAuthenticationSession(
  refreshToken: RefreshToken,
): Promise<void> {
  const redis = useRedis()

  const session = await getAuthenticationSession(refreshToken)

  if (!session)
    throw new Error('Refresh token not found!')

  const uid = session.uid

  await redis.del(`${REDIS_SESSION_NAMESPACE}:${refreshToken}`)

  await redis.srem(`${REDIS_SESSION_NAMESPACE}:${uid}`, [refreshToken])
}
