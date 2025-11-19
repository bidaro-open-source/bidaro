import { createLotResource } from '~~/server/resources/lot.resource'
import { lotService } from '~~/server/services/lot.service'
import { getLotRequest } from '../index.request'
import { shipLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotService.findByIdOrFail(request.params.id)

  shipLotPolicy(event, lot)

  const updatedLot = await lotService.shipLot(lot)

  return createLotResource(updatedLot)
})
