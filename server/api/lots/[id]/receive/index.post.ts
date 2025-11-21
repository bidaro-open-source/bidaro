import { createLotResource } from '~~/server/resources/lot.resource'
import { lotService } from '~~/server/services/lot.service'
import { getLotRequest } from '../index.request'
import { receiveLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotService.findByIdOrFail(request.params.id)

  receiveLotPolicy(event, lot)

  const updatedLot = await lotService.receive(request.params.id)

  return createLotResource(updatedLot)
})
