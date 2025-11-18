import { lotStatuses } from '~~/server/constants'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { deleteLotPolicy } from './index.delete.policy'
import { getLotRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotRepository.findByIdOrFail(request.params.id)

  deleteLotPolicy(event, lot)

  if (lot.statusName !== lotStatuses.DRAFT) {
    throw createError({
      message: 'Цей лот не може бути видалений, оскільки він вже опублікований',
      status: 400,
    })
  }

  await lotRepository.destroy(lot.id)
})
