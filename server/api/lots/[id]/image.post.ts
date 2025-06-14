import { lotStatuses } from '~~/server/constants'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { uploadLotImageRequest } from '~~/server/requests/lots/image.post.request'
import { imageResource } from '~~/server/resources/image.resource'
import { registerImage, unregisterImage } from '~~/server/services/image-service'

export default defineEventHandler(async (event) => {
  const request = await uploadLotImageRequest(event)

  const lot = await lotRepository.findById(request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  if (lot.statusName !== lotStatuses.DRAFT || lot.statusName !== lotStatuses.IN_TRADING_PROCESS) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Зображення не можно завантажити для цього лот через його статус',
    })
  }

  if (lot.imageId) {
    await unregisterImage(lot.imageId)
  }

  const image = await registerImage(request.multipart)

  lot.imageId = image.id

  await lotRepository.save(lot)

  return imageResource.create(image)
})
