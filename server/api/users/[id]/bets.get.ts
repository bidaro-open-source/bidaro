import type { Lot, LotBet, User } from '~~/server/database'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { getUserRequest } from '~~/server/requests/user.request'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserBetResource } from '~~/server/resources/user-bet.resource'
import { createUserResource } from '~~/server/resources/user.resource'

export default defineEventHandler(async (event) => {
  const request = await getUserRequest(event)

  const user = await userRepository.findById(request.params.id)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувача не знайдено',
    })
  }

  const bets = await userRepository.findAllBetsById(request.params.id)

  const lotIds = bets.map(l => l.lotId)

  const lotsBets = await lotRepository.countAllBetsByIds(lotIds)

  return bets.map(bet => ({
    ...createUserBetResource(bet),
    lot: {
      ...createLotResource(bet.lot as Lot),
      betsCount: lotsBets[bet.lotId],
      bets: ((bet.lot as Lot).bets as LotBet[]).map(b => ({
        ...createLotBetResource(b),
        user: createUserResource(b.user as User),
      })),
    },
  }))
})
