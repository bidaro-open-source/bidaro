import crypto from 'node:crypto'

export const REDIS_PASSWORD_RESET_NAMESPACE = 'password-reset-token'

export const recoveryService = {
  /**
   * Returns reset token.
   *
   * @returns random bytes
   */
  generateResetToken() {
    const runtimeConfig = useRuntimeConfig()
    return crypto.randomBytes(+runtimeConfig.password.resetSize).toString('hex')
  },

  /**
   * Generates token.
   *
   * @param resetToken refresh token
   * @returns user id
   */
  async getUserIdByToken(
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
  async createToken(
    uid: number,
  ): Promise<string> {
    const redis = useRedis()

    const token = recoveryService.generateResetToken()

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
  async deleteToken(
    resetToken: string,
  ): Promise<void> {
    await useRedis().del(`${REDIS_PASSWORD_RESET_NAMESPACE}:${resetToken}`)
  },
}
