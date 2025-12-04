import { challengeService } from '#domains/security'

export async function getChallengeSolution(challengeId: string) {
  const solution = await redis.get(`${challengeService.scope}:${challengeId}`)

  if (!solution) {
    throw new Error('Challenge solution not found')
  }

  return JSON.parse(solution) as { x: number, y: number }
}
