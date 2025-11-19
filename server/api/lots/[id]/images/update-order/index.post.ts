import { lotImageService } from '~~/server/services/lot-image.service'
import { lotService } from '~~/server/services/lot.service'
import { updateImageOrderPolicy } from './index.post.policy'
import { updateImageOrderRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateImageOrderRequest(event)

  const lot = await lotService.findByIdOrFail(request.params.id)

  updateImageOrderPolicy(event, lot)

  await lotImageService.updateImageOrder(request.params.id, request.body.ids)
})
