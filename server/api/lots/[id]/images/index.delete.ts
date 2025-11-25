import { lotImageService, lotSource } from '~~/server/modules/lots'
import { imageService } from '~~/server/modules/storage'
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
