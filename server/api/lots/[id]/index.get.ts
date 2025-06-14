import type { LotBet, User } from '~~/server/database'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { lotRequest } from '~~/server/requests/lots/lots.request'
import { categoryResource } from '~~/server/resources/category.resource'
import { imageResource } from '~~/server/resources/image.resource'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserResource } from '~~/server/resources/user.resource'

export default defineEventHandler(async (event) => {
  const user = getAuthenticatedUser(event)

  const request = await lotRequest(event)

  const lot = await lotRepository.findById(request.params.id)

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  if (lot.statusName === 'draft' && lot.userId !== user?.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  return {
    ...createLotResource(lot),
    user: createUserResource(lot.user as User),
    image: lot.image ? imageResource.create(lot.image) : null,
    winner: lot.winnerId ? createUserResource(lot.winner as User) : null,
    category: lot.category ? categoryResource.create(lot.category) : null,
    betsCount: await lotRepository.countAllBetsById(lot.id),
    bets: (lot.bets as LotBet[]).map(bet => ({
      ...createLotBetResource(bet),
      user: createUserResource(bet.user as User),
    })),
  }
})
