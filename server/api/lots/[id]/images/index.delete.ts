import { lotImageService, lotSource } from '~~/server/domains/auction'
import { imageService } from '~~/server/domains/storage'
import { deleteLotImagePolicy } from './index.delete.policy'
import { deleteLotImageRequest } from './index.delete.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await deleteLotImageRequest(event)

  const lot = await lotSource.getById(request.params.id)

  deleteLotImagePolicy(event, lot)

  const unattachedImageIds = await lotImageService.unattachImages(
    request.params.id,
    request.body.ids,
  )

  return await imageService.destroySafely(unattachedImageIds)
})
