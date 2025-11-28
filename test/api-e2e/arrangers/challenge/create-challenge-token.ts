import { v4 as uuidv4 } from 'uuid'
import { challengeTokenService } from '~~/server/domains/security/challenge/challenge-token.service'

export async function createChallengeToken() {
  const token = uuidv4()
  const key = `${challengeTokenService.scope}:${token}`

  await redis.set(key, '1', 'EX', 30 * 60 * 1000)

  return token
}
