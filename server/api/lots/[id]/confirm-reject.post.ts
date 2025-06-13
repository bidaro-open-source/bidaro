import type { User } from '~~/server/database'
import { lotStatuses } from '~~/server/constants'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { lotRequest } from '~~/server/requests/lots/lots.request'
import { categoryResource } from '~~/server/resources/category.resource'
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

  if (lot.statusName !== lotStatuses.IN_TRADING_PROCESS) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот не в процесі торгів',
    })
  }

  if (!lot.expirationDate) {
    throw createError({
      statusCode: 500,
      statusMessage: 'I',
      message: 'Лот не має дати закінчення торгів',
    })
  }

  if (lot.expirationDate.getTime() > Date.now()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот ще все в процесі торгів',
    })
  }

  if (!(lot.bets && lot.bets[0])) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Лот не має ставок',
    })
  }

  const winnerBet = lot.bets[0]

  if (user.id !== winnerBet.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот не можна скасувати, бо переможця визначено',
    })
  }

  lot.statusName = lotStatuses.REJECTED

  await lotRepository.save(lot)

  return {
    ...createLotResource(lot),
    user: createUserResource(user as User),
    winner: null,
    betsCount: await lotRepository.countAllBetsById(lot.id),
    category: lot.category ? categoryResource.create(lot.category) : null,
    bets: [
      {
        ...createLotBetResource(winnerBet),
        user: createUserResource(winnerBet.user as User),
      },
    ],
  }
})
