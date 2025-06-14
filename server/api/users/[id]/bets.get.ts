import type { Lot, User } from '~~/server/database'
import type { Category } from '~~/server/database/models/Category'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { getUserRequest } from '~~/server/requests/user.request'
import { categoryResource } from '~~/server/resources/category.resource'
import { imageResource } from '~~/server/resources/image.resource'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserBetResource } from '~~/server/resources/user-bet.resource'
import { createUserResource } from '~~/server/resources/user.resource'

export default defineEventHandler(async (event) => {
  const request = await getUserRequest(event)

  const user = await userRepository.findById(request.params.id)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувача не знайдено',
    })
  }

  const bets = await userRepository.findAllBetsById(request.params.id)

  const lotIds = bets.map(l => l.lotId)

  const lotsBets = await lotRepository.countAllBetsByIds(lotIds)

  return bets.map((bet) => {
    const lot = bet.lot as Lot
    const user = lot.user as User
    const winner = lot.winner as User | undefined
    const category = lot.category as Category | undefined
    const bets = lot.bets || []

    return {
      ...createUserBetResource(bet),
      lot: {
        ...createLotResource(lot),
        user: createUserResource(user),
        image: lot.image ? imageResource.create(lot.image) : null,
        winner: winner ? createUserResource(winner) : null,
        category: category ? categoryResource.create(category) : null,
        betsCount: lotsBets[bet.lotId],
        bets: bets.map(bet => ({
          ...createLotBetResource(bet),
          user: createUserResource(bet.user as User),
        })),
      },
    }
  })
})
