import { lotStatuses } from '~~/server/constants'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { createLotResource } from '~~/server/resources/lot.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  try {
    const user = getAuthenticatedUser(event)

    const lot = await lotRepository.create({
      title: 'Draft title',
      initialAmount: 100,
      initialDuration: '1_day',
      statusName: lotStatuses.DRAFT,
      userId: user.id,
    })

    setResponseStatus(event, 201)

    return createLotResource(lot)
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
