import type { LotBet, User } from '~~/server/database'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { getUserRequest } from '~~/server/requests/user.request'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserResource } from '~~/server/resources/user.resource'

export default defineEventHandler(async (event) => {
  const user = getAuthenticatedUser(event)

  const request = await getUserRequest(event)

  const userInDB = await userRepository.findById(request.params.id)

  if (!userInDB) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувача не знайдено',
    })
  }

  const lots = user && user.id === request.params.id
    ? await userRepository.findAllLotsById(request.params.id)
    : await userRepository.findPublishedLotsById(request.params.id)

  const lotIds = lots.map(l => l.id)

  const lotsBets = await lotRepository.countAllBetsByIds(lotIds)

  return lots.map(lot => ({
    ...createLotResource(lot),
    winner: lot.winner ? createUserResource(lot.winner as User) : null,
    betsCount: lotsBets[lot.id],
    bets: (lot.bets as LotBet[]).map(b => ({
      ...createLotBetResource(b),
      user: createUserResource(b.user as User),
    })),
  }))
})
