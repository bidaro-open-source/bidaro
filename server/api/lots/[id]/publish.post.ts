import { lotStatuses } from '~~/server/constants'
import { lotBetRepository } from '~~/server/repositories/lot-bet.repository'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { lotRequest } from '~~/server/requests/lots/lots.request'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserResource } from '~~/server/resources/user.resource'
import { calculateLotIntervals } from '~~/server/services/lot-service'

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

  if (lot.statusName !== lotStatuses.DRAFT) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот вже опубліковано',
    })
  }

  const transaction = await useDatabaseTransaction()

  try {
    const dates = calculateLotIntervals(lot.initialDuration)

    lot.statusName = lotStatuses.IN_TRADING_PROCESS
    lot.effectiveDate = dates.effectiveDate
    lot.expirationDate = dates.expirationDate

    await lotRepository.save(lot, { transaction })

    const lotBet = await lotBetRepository.create(
      {
        lotId: lot.id,
        userId: lot.userId,
        amount: lot.initialAmount,
      },
      { transaction },
    )

    const userResource = createUserResource(user)
    const response = {
      ...createLotResource(lot),
      user: userResource,
      winner: null,
      betsCount: 1,
      bets: [
        {
          ...createLotBetResource(lotBet),
          user: userResource,
        },
      ],
    }

    await transaction.commit()

    return response
  }
  catch (e) {
    await transaction.rollback()

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Не вдалося опублікувати лот',
      cause: e,
    })
  }
})
