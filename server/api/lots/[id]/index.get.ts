import { createImageResource, createLotResource, lotSource } from '~~/server/domains/auction'
import { categorySource, createCategoryResource } from '~~/server/domains/categories'
import { createUserResource, userSource } from '~~/server/domains/users'
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
    ...createLotResource(lot),
    images: images.map(createImageResource),
    seller: createUserResource(seller),
    winner: winner ? createUserResource(winner) : null,
    category: category ? createCategoryResource(category) : null,
  }
})
