import { lotRepository } from '~~/server/repositories/lot.repository'
import { imageService } from '~~/server/services/image'
import { lotService } from '~~/server/services/lot'
import { deleteLotImagePolicy } from './index.delete.policy'
import { deleteLotImageRequest } from './index.delete.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteLotImageRequest(event)

  const lot = await lotRepository.findByIdOrFail(request.params.id)

  deleteLotImagePolicy(event, lot)

  const unattachedImageIds = await lotService.unattachImages(
    request.params.id,
    request.body.ids,
  )

  return await imageService.destorySafely(unattachedImageIds)
})
