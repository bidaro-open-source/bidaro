import { v4 as uuidv4 } from 'uuid'

interface ChallengeAnswer {
  x: number
  y: number
}

class ChallengeService {
  /**
   * The allowed deviation in pixels for the user's answer.
   * Human input is rarely pixel-perfect, so a tolerance (e.g., +/- 5px) is required.
   */
  readonly scope: string = 'captcha'

  /**
   * The allowed deviation in pixels for the user's answer.
   * Human input is rarely pixel-perfect, so a tolerance (e.g., +/- 5px) is required.
   */
  readonly tolerance: number = 10

  /**
   * The time-to-live for a challenge in milliseconds (e.g., 30 minutes).
   */
  readonly sessionTtl: number = 30 * 60 * 1000

  /**
   * Creates a new challenge session in Redis.
   *
   * @param solution - The correct coordinates object.
   * @returns The unique Challenge ID to be sent to the client.
   */
  async create(solution: ChallengeAnswer) {
    try {
      const redis = useRedis()

      const id = uuidv4()
      const key = `${this.scope}:${id}`
      const data = JSON.stringify(solution)

      await redis.set(key, data, 'EX', this.sessionTtl)

      return id
    }
    catch (error) {
      logger.error('Error creating challenge:', error)
      return null
    }
  }

  /**
   * Verifies the user's provided coordinates against the stored solution in Redis.
   *
   * The session is strictly one-time use and is deleted immediately after verification.
   *
   * @param id - The unique challenge ID sent by the client.
   * @param answer - The coordinates provided by the user.
   * @returns True if the answer is valid, false otherwise.
   */
  async verify(id: string, answer: ChallengeAnswer) {
    try {
      const redis = useRedis()
      const key = `${this.scope}:${id}`

      const data = await redis.get(key)

      if (!data) {
        return false
      }

      const session = JSON.parse(data as string) as ChallengeAnswer

      const isXValid = Math.abs(session.x - answer.x) <= this.tolerance
      const isYValid = Math.abs(session.y - answer.y) <= this.tolerance

      await redis.del(key)

      return isXValid && isYValid
    }
    catch (error) {
      logger.error('Error verifying challenge:', error)
      return false
    }
  }
}

export const challengeService = new ChallengeService()
