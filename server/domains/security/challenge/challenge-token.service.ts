import { v4 as uuidv4 } from 'uuid'

class ChallengeTokenService {
  /**
   * The time-to-live for a token in milliseconds (e.g., 30 minutes).
   */
  readonly scope: string = 'captcha_token'

  /**
   * The time-to-live for a token in milliseconds (e.g., 30 minutes).
   */
  readonly tokenTtl: number = 30 * 60 * 1000

  /**
   * Generates a secure token indicating that a user has passed the CAPTCHA.
   * The token is stored in Redis with an expiration time.
   *
   * @returns A unique token string to be sent to the client.
   */
  async create() {
    try {
      const token = uuidv4()
      const redis = useRedis()
      const key = `${this.scope}:${token}`

      await redis.set(key, '1', 'EX', this.tokenTtl)

      return token
    }
    catch (error) {
      console.warn('Error creating challenge token:', error)
      return null
    }
  }

  /**
   * Verifies if a token is valid and immediately consumes (deletes) it.
   *
   * @param token - The token string provided by the client.
   * @returns True if the token existed and was valid, false otherwise.
   */
  async verify(token: string) {
    try {
      const redis = useRedis()
      const key = `${this.scope}:${token}`

      const exists = await redis.get(key)

      if (!exists) {
        return false
      }

      await redis.del(key)

      return true
    }
    catch (error) {
      console.warn('Error verifying challenge token:', error)
      return false
    }
  }
}

export const challengeTokenService = new ChallengeTokenService()
