import { createImageResource, lotImageRepository, lotSource } from '~~/server/domains/auction'
import { viewLotRequest } from '../index.request'

export default defineEventHandler(async (event) => {
  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const images = await lotImageRepository.findAllByLotId(lot.id)

  return images.map(createImageResource)
})
