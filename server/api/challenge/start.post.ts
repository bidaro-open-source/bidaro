import { challengeGeneratorService, challengeService } from '#domains/security'

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

  const challenge = await challengeGeneratorService.generate()

  const challengeId = await challengeService.create({
    x: challenge.piecePosX,
    y: challenge.piecePosY,
  })

  if (!challengeId) {
    throw createAppError('CHALLENGE_CREATION_FAILED')
  }

  return {
    challengeId,
    width: challenge.width,
    height: challenge.height,
    background: challenge.background,
    piece: challenge.piece,
    pieceWidth: challenge.pieceWidth,
    pieceHeight: challenge.pieceHeight,
  }
})
