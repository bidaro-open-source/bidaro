import { lotRepository } from '~~/server/repositories/lot.repository'
import { createLotResource } from '~~/server/resources/lot.resource'
import { getLotRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await getLotRequest(event)

  const lot = await lotRepository.findByIdOrFail(request.params.id)

  return createLotResource(lot)
})
