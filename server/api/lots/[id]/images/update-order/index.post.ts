import { lotImageService, lotSource } from '~~/server/domains/auction'
import { updateImageOrderPolicy } from './index.post.policy'
import { updateImageOrderRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await updateImageOrderRequest(event)

  const lot = await lotSource.getById(request.params.id)

  updateImageOrderPolicy(event, lot)

  await lotImageService.updateImageOrder(request.params.id, request.body.ids)
})
