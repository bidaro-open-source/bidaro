import crypto from 'node:crypto'

export const REDIS_EMAIL_VERIFICATION_NAMESPACE = 'email-verification'

export const verificationService = {
  /**
   * Returns reset token.
   *
   * @returns random bytes
   */
  generateVerifyToken() {
    const runtimeConfig = useRuntimeConfig()
    return crypto.randomBytes(+runtimeConfig.email.tokenSize).toString('hex')
  },

  /**
   * Generates token.
   *
   * @param verifyToken verify token
   * @returns user id
   */
  async getUserIdByToken(
    verifyToken: string,
  ): Promise<number | null> {
    const redis = useRedis()

    const uid = await redis.get(
      `${REDIS_EMAIL_VERIFICATION_NAMESPACE}:tokens:${verifyToken}`,
    )

    return Number.isInteger(Number(uid)) ? Number(uid) : null
  },

  /**
   * Generates token.
   *
   * @param uid user id
   * @returns token for verify email
   */
  async createToken(
    uid: number,
  ): Promise<string> {
    const redis = useRedis()

    const token = verificationService.generateVerifyToken()

    await redis
      .multi()
      .set(
        `${REDIS_EMAIL_VERIFICATION_NAMESPACE}:users:${uid}`,
        token,
      )
      .set(
        `${REDIS_EMAIL_VERIFICATION_NAMESPACE}:tokens:${token}`,
        uid,
      )
      .exec()

    return token
  },

  /**
   * Delete email verification token by token.
   *
   * @param verifyToken verify token
   */
  async deleteToken(
    verifyToken: string,
  ): Promise<void> {
    const redis = useRedis()

    const uid = await redis.get(
      `${REDIS_EMAIL_VERIFICATION_NAMESPACE}:tokens:${verifyToken}`,
    )

    await redis
      .multi()
      .del(`${REDIS_EMAIL_VERIFICATION_NAMESPACE}:tokens:${verifyToken}`)
      .del(`${REDIS_EMAIL_VERIFICATION_NAMESPACE}:users:${uid}`)
      .exec()
  },

  /**
   * Delete email verification token by user id.
   *
   * @param uid user primary key
   */
  async deleteTokenByUserId(
    uid: number,
  ): Promise<void> {
    const redis = useRedis()

    const token = await redis.get(
      `${REDIS_EMAIL_VERIFICATION_NAMESPACE}:users:${uid}`,
    )

    await redis
      .multi()
      .del(`${REDIS_EMAIL_VERIFICATION_NAMESPACE}:tokens:${token}`)
      .del(`${REDIS_EMAIL_VERIFICATION_NAMESPACE}:users:${uid}`)
      .exec()
  },
}
