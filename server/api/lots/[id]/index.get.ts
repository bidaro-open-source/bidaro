import { categorySource, createCategoryResource } from '~~/server/modules/categories'
import { createImageResource, createLotBetResource, createLotResource, lotSource } from '~~/server/modules/lots'
import { createUserResource, userSource } from '~~/server/modules/users'
import { getLotRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await getLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  const [bets, images, seller, winner, category] = await Promise.all([
    lotSource.getAllBetsById(lot.id),
    lotSource.getAllImagesById(lot.id),
    userSource.getById(lot.sellerId),
    lot.winnerId ? userSource.getById(lot.winnerId) : Promise.resolve(),
    lot.categoryId ? categorySource.getById(lot.categoryId) : Promise.resolve(),
  ])

  return {
    ...createLotResource(lot),
    bets: bets.map(createLotBetResource),
    images: images.map(createImageResource),
    seller: createUserResource(seller),
    winner: winner ? createUserResource(winner) : null,
    category: category ? createCategoryResource(category) : null,
  }
})
