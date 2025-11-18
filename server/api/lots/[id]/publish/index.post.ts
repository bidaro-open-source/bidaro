import { lotInitialDurationsInMs, lotStatuses } from '~~/server/constants'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { createLotResource } from '~~/server/resources/lot.resource'
import { getLotRequest } from '../index.request'
import { publishLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotRepository.findByIdOrFail(request.params.id)

  publishLotPolicy(event, lot)

  if (lot.statusName !== lotStatuses.DRAFT) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот вже опубліковано',
    })
  }

  try {
    lot.statusName = lotStatuses.IN_TRADING_PROCESS
    lot.effectiveDate = new Date()
    lot.expirationDate = new Date(Date.now() + lotInitialDurationsInMs[lot.initialDuration])
    lot.currentPrice = lot.initialPrice

    await lotRepository.save(lot)

    return createLotResource(lot)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unprocessable Content',
      message: 'Невідома помилка під час публікації лота',
      data: error,
    })
  }
})
