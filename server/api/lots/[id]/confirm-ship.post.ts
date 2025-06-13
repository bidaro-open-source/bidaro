import type { User } from '~~/server/database'
import { lotStatuses } from '~~/server/constants'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { lotRequest } from '~~/server/requests/lots/lots.request'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserResource } from '~~/server/resources/user.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await lotRequest(event)

  const lot = await userRepository.findLotById(user.id, request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  if (lot.statusName !== lotStatuses.IN_DISCUSSION_PROCESS) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот не в процесі обговорення',
    })
  }

  if (!(lot.bets && lot.bets[0])) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Лот не має ставок',
    })
  }

  const latestBet = lot.bets[0]

  lot.statusName = lotStatuses.IN_DELIVERY_PROCESS

  await lotRepository.save(lot)

  return {
    ...createLotResource(lot),
    user: createUserResource(user as User),
    winner: createUserResource(latestBet.user as User),
    betsCount: await lotRepository.countAllBetsById(lot.id),
    bets: [
      {
        ...createLotBetResource(latestBet),
        user: createUserResource(latestBet.user as User),
      },
    ],
  }
})
