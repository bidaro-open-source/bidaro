import type { User } from '~~/server/database'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { lotRequest } from '~~/server/requests/lots/lots.request'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createUserResource } from '~~/server/resources/user.resource'

export default defineEventHandler(async (event) => {
  const request = await lotRequest(event)

  const lot = await lotRepository.findById(request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  const bets = await lotRepository.findAllBetsById(request.params.id)

  return bets.map(bet => ({
    ...createLotBetResource(bet),
    user: createUserResource(bet.user as User),
  }))
})
