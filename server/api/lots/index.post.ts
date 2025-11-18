import { lotInitialDurations, lotStatuses } from '~~/server/constants'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { createOnlyLotResource } from '~~/server/resources/lot.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  try {
    const user = getAuthenticatedUser(event)

    const lot = await lotRepository.create({
      title: 'Чернетка',
      initialPrice: 1,
      initialDuration: lotInitialDurations.THREE_DAYS,
      statusName: lotStatuses.DRAFT,
      sellerId: user.id,
    })

    setResponseStatus(event, 201)

    return createOnlyLotResource(lot)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unprocessable Content',
      message: 'Невідома помилка під час створення лота',
      data: error,
    })
  }
})
