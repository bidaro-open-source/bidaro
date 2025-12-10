import { challengeService, challengeTokenService } from '#domains/security'
import { verifyChallengeRequest } from './verify.request'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.challenge.enabled) {
    throw createAppError('FEATURE_DISABLED', { feature: 'challenge' })
  }

  await useRateLimiter(event, {
    authenticatedLimit: 0,
    anonymousLimit: 20,
    duration: 60,
  })

  const request = await verifyChallengeRequest(event)

  const isValid = await challengeService.verify(
    request.body.challengeId,
    {
      x: request.body.x,
      y: request.body.y,
    },
  )

  if (!isValid) {
    throw createAppError('INVALID_CHALLENGE_SOLUTION')
  }

  const token = await challengeTokenService.create()

  if (!token) {
    throw createAppError('INTERNAL_SERVER_ERROR')
  }

  return {
    token,
  }
})
