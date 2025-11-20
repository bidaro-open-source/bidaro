import { imageService } from '~~/server/services/image.service'
import { lotImageService } from '~~/server/services/lot-image.service'
import { lotService } from '~~/server/services/lot.service'
import { deleteLotImagePolicy } from './index.delete.policy'
import { deleteLotImageRequest } from './index.delete.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteLotImageRequest(event)

  const lot = await lotService.findByIdOrFail(request.params.id)

  deleteLotImagePolicy(event, lot)

  const unattachedImageIds = await lotImageService.unattachImages(
    request.params.id,
    request.body.ids,
  )

  return await imageService.destroySafely(unattachedImageIds)
})
