import { lotStatuses } from '~~/server/constants'
import { lotBetRepository } from '~~/server/repositories/lot-bet.repository'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { createLotBetRequest } from '~~/server/requests/lots/bets.post.request'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { calcualteLotMinimalStep } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await createLotBetRequest(event)

  const lot = await lotRepository.findById(request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  if (lot.userId === user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Ви не можете зробити ставку на свій лот',
    })
  }

  if (lot.statusName !== lotStatuses.IN_TRADING_PROCESS) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот не знаходиться в статусі торгів',
    })
  }

  const latestBet = lot.bets && lot.bets[0]

  if (!latestBet) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Latest bet not found',
    })
  }

  if (request.body.amount <= latestBet.amount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Ставка має бути більшою за останню ставку',
    })
  }

  const minimalStep = calcualteLotMinimalStep(latestBet.amount)

  if (request.body.amount - latestBet.amount <= minimalStep) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: `Ставка має бути більшою за минімальний крок ${minimalStep}`,
    })
  }

  const lotBet = await lotBetRepository.create({
    lotId: request.params.id,
    userId: user.id,
    amount: request.body.amount,
  })

  setResponseStatus(event, 201)

  return createLotBetResource(lotBet)
})
