import { createLotResource } from '~~/server/resources/lot.resource'
import { lotService } from '~~/server/services/lot.service'
import { lotSource } from '~~/server/sources/lot.source'
import { getLotRequest } from '../index.request'
import { publishLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  publishLotPolicy(event, lot)

  const updatedLot = await lotService.publish(request.params.id)

  return createLotResource(updatedLot)
})
