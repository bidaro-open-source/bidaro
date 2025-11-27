import { lotImageRepository, lotSource } from '~~/server/domains/auction'
import { imageResource } from '~~/server/domains/storage'
import { viewLotRequest } from '../index.request'
import { viewLotImagesPolicy } from './index.get.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  viewLotImagesPolicy(event)

  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const images = await lotImageRepository.findAllByLotId(lot.id)

  return imageResource.collection(images)
})
