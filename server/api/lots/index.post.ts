import type { Category } from '~~/server/database/models/Category'
import { lotStatuses } from '~~/server/constants'
import { categoryRepository } from '~~/server/repositories/category.repository'
import { lotBetRepository } from '~~/server/repositories/lot-bet.repository'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { createLotRequest } from '~~/server/requests/lots/lots.post.request'
import { categoryResource } from '~~/server/resources/category.resource'
import { imageResource } from '~~/server/resources/image.resource'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserResource } from '~~/server/resources/user.resource'
import { calculateLotIntervals } from '~~/server/services/lot-service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await createLotRequest(event)

  const transaction = await useDatabaseTransaction()

  try {
    let category: Category | null = null
    const dates = calculateLotIntervals(request.body.initialDuration)

    if (request.body.categoryId) {
      category = await categoryRepository.findById(request.body.categoryId)

      if (!category) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: 'Категорія не знайдена',
        })
      }
    }

    const lot = await lotRepository.create({
      userId: user.id,
      categoryId: request.body.categoryId,
      title: request.body.title,
      description: request.body.description,
      initialAmount: request.body.initialAmount,
      initialDuration: request.body.initialDuration,
      statusName: lotStatuses.IN_TRADING_PROCESS,
      effectiveDate: dates.effectiveDate,
      expirationDate: dates.expirationDate,
    }, { transaction })

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
      image: lot.image ? imageResource.create(lot.image) : null,
      winner: null,
      category: category ? categoryResource.create(category) : null,
      betsCount: 1,
      bets: [
        {
          ...createLotBetResource(lotBet),
          user: userResource,
        },
      ],
    }

    await transaction.commit()

    setResponseStatus(event, 201)

    return response
  }
  catch (e) {
    await transaction.rollback()

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Не вдалося створити лот',
      cause: e,
    })
  }
})
