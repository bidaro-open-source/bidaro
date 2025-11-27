import { lotResource, lotSource } from '#domains/auction'
import { categoryResource, categorySource } from '#domains/categories'
import { imageResource } from '#domains/storage'
import { userResource, userSource } from '#domains/users'
import { viewLotRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const [images, seller, winner, category] = await Promise.all([
    lotSource.getAllImagesById(lot.id),
    userSource.getByPk(lot.sellerId),
    lot.winnerId ? userSource.getByPk(lot.winnerId) : Promise.resolve(),
    lot.categoryId ? categorySource.getById(lot.categoryId) : Promise.resolve(),
  ])

  return {
    ...lotResource.make(lot),
    images: imageResource.collection(images),
    seller: userResource.make(seller),
    winner: userResource.make(winner || null),
    category: categoryResource.make(category || null),
  }
})
