import { lotRepository } from '~~/server/repositories/lot.repository'
import { lotService } from '~~/server/services/lot'
import { updateImageOrderPolicy } from './index.post.policy'
import { updateImageOrderRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateImageOrderRequest(event)

  const lot = await lotRepository.findByIdOrFail(request.params.id)

  updateImageOrderPolicy(event, lot)

  await lotService.updateImageOrder(request.params.id, request.body.ids)
})
