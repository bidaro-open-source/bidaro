import { lotResource, lotService, lotSource } from '#domains/auction'
import { updateLotPolicy } from './index.patch.policy'
import { updateLotRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  updateLotPolicy(event, lot)

  const updatedLot = await lotService.update(request.params.id, request.body)

  return lotResource.make(updatedLot)
})
