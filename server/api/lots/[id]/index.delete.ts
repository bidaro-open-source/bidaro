import { lotService, lotSource } from '~~/server/modules/lots'
import { deleteLotPolicy } from './index.delete.policy'
import { getLotRequest } from './index.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  deleteLotPolicy(event, lot)

  await lotService.delete(request.params.id)
})
