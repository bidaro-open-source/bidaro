export const REDIS_EMAIL_VERIFICATION_NAMESPACE = 'email-verification'

export const profileVerificationService = {
  /**
   * Generates token.
   *
   * @param verifyToken verify token
   * @returns user id
   */
  async getUserIdByEmailVerificationToken(
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
  async createEmailVerificationToken(
    uid: number,
  ): Promise<string> {
    const redis = useRedis()

    const token = createVerifyToken()

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
  async deleteEmailVerificationToken(
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
  async deleteEmailVerificationTokenByUid(
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
