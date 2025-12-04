import { challengeService, challengeTokenService } from '#domains/security'
import { verifyChallengeRequest } from './verify.request'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.challenge.enabled) {
    throw createError({
      statusCode: 404,
    })
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
    throw createError({
      statusCode: 400,
      statusMessage: 'Невірне рішення капчі',
    })
  }

  const token = await challengeTokenService.create()

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Не вдалося створити токен для капчі',
    })
  }

  return {
    token,
  }
})
