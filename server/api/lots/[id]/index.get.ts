import { createCategoryResource } from '~~/server/resources/category.resource'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createImageResource } from '~~/server/resources/lot-image.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserResource } from '~~/server/resources/user.resource'
import { categorySource } from '~~/server/sources/category.source'
import { lotSource } from '~~/server/sources/lot.source'
import { userSource } from '~~/server/sources/user.source'
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
