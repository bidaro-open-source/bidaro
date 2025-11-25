import crypto from 'node:crypto'

const REDIS_PASSWORD_RESET_NAMESPACE = 'password-reset-token'

class RecoveryService {
  /**
   * Returns Redis key for the given token.
   *
   * @param token reset token
   * @returns Redis key
   */
  private getKey(token: string) {
    return `${REDIS_PASSWORD_RESET_NAMESPACE}:${token}`
  }

  /**
   * Generates reset token.
   *
   * @returns reset token
   */
  private generateResetToken() {
    const runtimeConfig = useRuntimeConfig()
    return crypto.randomBytes(+runtimeConfig.password.resetSize).toString('hex')
  }

  /**
   * Gets user primary key by token.
   *
   * @param resetToken reset token
   * @returns user primary key or null if not found
   */
  async getUserIdByToken(resetToken: string) {
    const redis = useRedis()
    const key = this.getKey(resetToken)

    const data = await redis.get(key)

    return Number.isInteger(Number(data)) ? Number(data) : null
  }

  /**
   * Creates token for reset password.
   *
   * @param uid - user primary key
   * @returns token for reset password
   */
  async createToken(uid: number) {
    const redis = useRedis()

    const token = this.generateResetToken()
    const key = this.getKey(token)

    await redis.set(key, uid, 'EX', 86400)

    return token
  }

  /**
   * Deletes reset token.
   *
   * @param resetToken reset token
   */
  async deleteToken(resetToken: string) {
    const key = this.getKey(resetToken)
    await useRedis().del(key)
  }
}

export const recoveryService = new RecoveryService()
