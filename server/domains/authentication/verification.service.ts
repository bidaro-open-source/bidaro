import crypto from 'node:crypto'

export const REDIS_EMAIL_VERIFICATION_NAMESPACE = 'email-verification'

class VerificationService {
  /**
   * Redis keys.
   */
  private get keys() {
    return {
      token: (token: string) =>
        `${REDIS_EMAIL_VERIFICATION_NAMESPACE}:token:${token}`,
      tokens: (uid: number) =>
        `${REDIS_EMAIL_VERIFICATION_NAMESPACE}:user:${uid}`,
    }
  }

  /**
   * Returns reset token.
   *
   * @returns random bytes
   */
  private generateVerifyToken() {
    const runtimeConfig = useRuntimeConfig()
    return crypto.randomBytes(+runtimeConfig.email.tokenSize).toString('hex')
  }

  /**
   * Gets user primary key by token.
   *
   * @param verifyToken verify token
   * @returns user primary key
   */
  async getUserIdByToken(verifyToken: string) {
    const redis = useRedis()
    const key = this.keys.token(verifyToken)

    const uid = await redis.get(key)

    return Number.isInteger(Number(uid)) ? Number(uid) : null
  }

  /**
   * Creates token for verify email.
   *
   * @param uid user primary key
   * @returns token for verify email
   */
  async createToken(uid: number) {
    const redis = useRedis()

    const token = this.generateVerifyToken()
    const tokenKey = this.keys.token(token)
    const tokensKey = this.keys.tokens(uid)

    await redis
      .multi()
      .set(tokenKey, uid)
      .set(tokensKey, token)
      .exec()

    return token
  }

  /**
   * Delete email verification token by token.
   *
   * @param verifyToken verify token
   */
  async deleteToken(verifyToken: string) {
    const redis = useRedis()

    const tokenKey = this.keys.token(verifyToken)

    const uid = await redis.get(tokenKey)

    if (uid) {
      const tokensKey = this.keys.tokens(Number(uid))

      await redis
        .multi()
        .del(tokenKey)
        .del(tokensKey)
        .exec()
    }
  }

  /**
   * Delete email verification token by user primary key.
   *
   * @param uid user primary key
   */
  async deleteTokenByUserId(uid: number) {
    const redis = useRedis()

    const tokensKey = this.keys.tokens(uid)

    const token = await redis.get(tokensKey)

    if (token) {
      const tokenKey = this.keys.token(token)

      await redis
        .multi()
        .del(tokenKey)
        .del(tokensKey)
        .exec()
    }
  }
}

export const verificationService = new VerificationService()
