import { createLotResource, lotService, lotSource } from '~~/server/modules/lots'
import { getLotRequest } from '../index.request'
import { shipLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  shipLotPolicy(event, lot)

  const updatedLot = await lotService.ship(request.params.id)

  return createLotResource(updatedLot)
})
