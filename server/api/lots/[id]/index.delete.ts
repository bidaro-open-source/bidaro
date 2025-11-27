import { lotService, lotSource } from '#domains/auction'
import { deleteLotPolicy } from './index.delete.policy'
import { viewLotRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  deleteLotPolicy(event, lot)

  await lotService.delete(request.params.id)
})
