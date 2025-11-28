import { challengeGeneratorService } from '~~/server/domains/security/challenge/challenge-generator.service'
import { challengeService } from '~~/server/domains/security/challenge/challenge.service'

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

  const challenge = await challengeGeneratorService.generate()

  const challengeId = await challengeService.create({
    x: challenge.piecePosX,
    y: challenge.piecePosY,
  })

  if (!challengeId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Не вдалося створити виклик для капчі',
    })
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
