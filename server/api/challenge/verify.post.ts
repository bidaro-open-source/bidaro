import { AppError } from '#classes/app-error'
import { challengeService, challengeTokenService } from '#domains/security'
import { verifyChallengeRequest } from './verify.request'

/**
 * API endpoint handler
 * @throws {AppError} INVALID_CHALLENGE_SOLUTION
 * @throws {AppError} CHALLENGE_TOKEN_CREATION_FAILED
 * @throws {AppError} NOT_FOUND
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.challenge.enabled) {
    throw new AppError('NOT_FOUND')
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
    throw new AppError('INVALID_CHALLENGE_SOLUTION')
  }

  const token = await challengeTokenService.create()

  if (!token) {
    throw new AppError('CHALLENGE_TOKEN_CREATION_FAILED')
  }

  return {
    token,
  }
})
