import { createImageResource, lotImageRepository, lotSource } from '~~/server/modules/lots'
import { getLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await getLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const images = await lotImageRepository.findAllByLotId(lot.id)

  return images.map(createImageResource)
})
