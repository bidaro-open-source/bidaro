import { lotService } from '~~/server/services/lot.service'
import { deleteLotPolicy } from './index.delete.policy'
import { getLotRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotService.findByIdOrFail(request.params.id)

  deleteLotPolicy(event, lot)

  await lotService.delete(request.params.id)
})
