import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export type AccessToken = string
export type RefreshToken = string
export type SessionUUID = string

export interface AccessTokenPayload {
  uid: number
}

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

class AuthenticationService {
  readonly sessionLimit = 6

  /**
   * Redis keys.
   */
  get keys() {
    return {
      token: (token: string) => `${REDIS_SESSION_NAMESPACE}:t:${token}`,
      tokens: (uid: number) => `${REDIS_SESSION_NAMESPACE}:u:${uid}`,
    }
  }

  /**
   * Returns refresh token.
   *
   * @returns random bytes
   */
  private createRefreshToken(event?: H3Event) {
    const runtimeConfig = useRuntimeConfig(event)

    return crypto.randomBytes(+runtimeConfig.jwt.refreshSize).toString('hex')
  }

  /**
   * Creates and signs a new JWT access token with the provided payload.
   *
   * @param payload token data
   * @returns signed access token string
   */
  private createAccessToken(payload: AccessTokenPayload): AccessToken {
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
  verifyAccessToken(token: AccessToken): boolean {
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
  decodeAccessToken(token: AccessToken): AccessTokenPayload {
    return jwt.decode(token) as AccessTokenPayload
  }

  /**
   * Returns user refresh session by refresh token.
   *
   * @param refreshToken refresh token
   * @returns user session data
   */
  async getSession(refreshToken: RefreshToken) {
    const redis = useRedis()
    const key = this.keys.token(refreshToken)
    const data = await redis.get(key)

    try {
      return data ? JSON.parse(data) as SessionMetadata : null
    }
    catch (error) {
      console.warn('Failed to parse session data from Redis:', error)
      return null
    }
  }

  /**
   * Returns user sessions. When gets session metadata, clear
   * old tokens, which not exists.
   *
   * If some session data is corrupted, it will be removed from the list.
   *
   * @param uid user primary key
   * @returns array of user session data
   */
  async getSessions(uid: number) {
    const redis = useRedis()
    const tokensKey = this.keys.tokens(uid)
    const tokens = await redis.zrange(tokensKey, 0, -1)
    const sessions: SessionMetadataCollection = {}
    const inactiveTokens: SessionUUID[] = []

    if (tokens.length) {
      const tokenKeys = tokens.map(this.keys.token)
      const allSessions = await redis.mget(tokenKeys)

      for (let i = 0; i < tokens.length; i++) {
        const currectToken = tokens[i]
        const currectSession = allSessions[i]

        if (currectSession !== null) {
          try {
            sessions[currectToken] = JSON.parse(currectSession)
          }
          catch (error) {
            console.warn('Failed to parse session data from Redis:', error)
            inactiveTokens.push(currectToken)
          }
        }
        else {
          inactiveTokens.push(currectToken)
        }
      }
    }

    if (inactiveTokens.length) {
      await redis.zrem(tokensKey, inactiveTokens)
    }

    return sessions
  }

  /**
   * Checks if the refresh token is whitelisted and still active.
   *
   * @param refreshToken refresh token
   * @returns boolean
   */
  async verifySession(refreshToken: RefreshToken) {
    const tokenKey = this.keys.token(refreshToken)
    return !!(await useRedis().get(tokenKey))
  }

  /**
   * Creates a new session for the user that consists of access and refresh
   * tokens.
   *
   * Already adding refresh token to the whitelist.
   *
   * @param uid user primary key
   * @param metadata additional request metadata
   * @returns pair of refresh and access tokens
   */
  async createSession(uid: number, metadata?: RequestMetadata) {
    const redis = useRedis()
    const runtimeConfig = useRuntimeConfig()

    const uuid = uuidv4()
    const accessToken = this.createAccessToken({ uid })
    const refreshToken = this.createRefreshToken()
    const refreshTokenTTL = +runtimeConfig.jwt.refreshTTL
    const sessionMetadata = { uid, uuid, ...metadata }

    const tokenKey = this.keys.token(refreshToken)
    const tokensKey = this.keys.tokens(uid)
    const data = JSON.stringify(sessionMetadata)
    const now = Date.now()

    const sessionCount = await redis.zcard(tokensKey)

    if (sessionCount >= this.sessionLimit) {
      const tokensToRemove = await redis.zrange(tokensKey, 0, sessionCount - this.sessionLimit)

      if (tokensToRemove.length) {
        await redis.multi()
          .del(...tokensToRemove.map(t => this.keys.token(t)))
          .zrem(tokensKey, ...tokensToRemove)
          .exec()
      }
    }

    await redis
      .multi()
      .set(tokenKey, data, 'EX', refreshTokenTTL)
      .zadd(tokensKey, now, refreshToken)
      .pexpire(tokensKey, refreshTokenTTL * 1000)
      .exec()

    return {
      uuid,
      accessToken,
      refreshToken,
    } as SessionData
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
  async updateSession(refreshToken: RefreshToken, metadata?: RequestMetadata) {
    const redis = useRedis()
    const runtimeConfig = useRuntimeConfig()

    const session = await this.getSession(refreshToken)

    if (!session)
      throw new Error('Refresh token not found!')

    const uid = session.uid
    const uuid = uuidv4()
    const newAccessToken = this.createAccessToken({ uid })
    const newRefreshToken = this.createRefreshToken()
    const refreshTokenTTL = +runtimeConfig.jwt.refreshTTL

    const sessionMetadata = { uid, uuid, ...metadata }

    const tokensKey = this.keys.tokens(uid)
    const oldTokenKey = this.keys.token(refreshToken)
    const newTokenKey = this.keys.token(newRefreshToken)
    const data = JSON.stringify(sessionMetadata)
    const now = Date.now()

    await redis
      .multi()
      .zrem(tokensKey, refreshToken)
      .zadd(tokensKey, now, newRefreshToken)
      .pexpire(tokensKey, refreshTokenTTL * 1000)
      .rename(oldTokenKey, newTokenKey)
      .set(newTokenKey, data, 'EX', refreshTokenTTL)
      .exec()

    return {
      uuid,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } as SessionData
  }

  /**
   * Deletes refresh session from the whitelist.
   *
   * @param uid user primary key
   * @param refreshToken refresh token
   * @throw if the refresh token is not whitelisted
   */
  async deleteSession(uid: number, refreshToken: RefreshToken) {
    const redis = useRedis()

    const tokenKey = this.keys.token(refreshToken)
    const tokensKey = this.keys.tokens(uid)

    await redis
      .multi()
      .del(tokenKey)
      .zrem(tokensKey, refreshToken)
      .exec()
  }

  /**
   * Deletes refresh session from the whitelist by uuid.
   *
   * @param uid user primary key
   * @param uuids array of session uuid
   * @returns array of action status
   * @throw if the refresh token is not whitelisted
   */
  async deleteSessions(uid: number, uuids: SessionUUID[]) {
    const sessions = await this.getSessions(uid)

    const handledSessions = Array
      .from<boolean>({ length: uuids.length })
      .fill(false)

    for (const refreshToken in sessions) {
      const session = sessions[refreshToken]

      const sessionIndex = uuids.findIndex(uuid => uuid === session.uuid)

      if (sessionIndex !== -1) {
        try {
          await this.deleteSession(uid, refreshToken)
          handledSessions[sessionIndex] = true
        }
        catch (e) {
          handledSessions[sessionIndex] = false
        }
      }
    }

    return handledSessions
  }
}

export const authService = new AuthenticationService()
