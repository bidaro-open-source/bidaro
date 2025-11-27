import { lotResource, lotService, lotSource } from '~~/server/domains/auction'
import { viewLotRequest } from '../index.request'
import { publishLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  publishLotPolicy(event, lot)

  const updatedLot = await lotService.publish(request.params.id)

  return lotResource.make(updatedLot)
})
