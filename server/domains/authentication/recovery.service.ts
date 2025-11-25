export const REDIS_PASSWORD_RESET_NAMESPACE = 'password-reset-token'

export const profileRecoveryService = {
  /**
   * Generates token.
   *
   * @param resetToken refresh token
   * @returns user id
   */
  async getUserIdByResetToken(
    resetToken: string,
  ): Promise<number | null> {
    const redis = useRedis()

    const data = await redis.get(
      `${REDIS_PASSWORD_RESET_NAMESPACE}:${resetToken}`,
    )

    return Number.isInteger(Number(data)) ? Number(data) : null
  },

  /**
   * Generates token.
   *
   * @param uid user id
   * @returns token for reset password
   */
  async createPasswordResetToken(
    uid: number,
  ): Promise<string> {
    const redis = useRedis()

    const token = createResetToken()

    await redis.set(
      `${REDIS_PASSWORD_RESET_NAMESPACE}:${token}`,
      uid,
      'EX',
      86400,
    )

    return token
  },

  /**
   * Generates token.
   *
   * @param resetToken refresh token
   * @returns user session data
   */
  async deletePasswordResetToken(
    resetToken: string,
  ): Promise<void> {
    await useRedis().del(`${REDIS_PASSWORD_RESET_NAMESPACE}:${resetToken}`)
  },
}
