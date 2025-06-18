import type { User } from '~~/server/database'
import type { Category } from '~~/server/database/models/Category'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { userRepository } from '~~/server/repositories/user.repository'
import { getUserRequest } from '~~/server/requests/user.request'
import { categoryResource } from '~~/server/resources/category.resource'
import { imageResource } from '~~/server/resources/image.resource'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
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

  const db = useDatabase()

  const lots = await db.Lot.findAll({
    include: [
      {
        model: db.Image,
        as: 'image',
      },
      {
        model: db.User,
        as: 'winner',
      },
      {
        model: db.Category,
        as: 'category',
      },
      {
        model: db.LotBet,
        as: 'bets',
        where: { userId: user.id },
        attributes: [],
        required: true,
      },
      {
        model: db.LotBet,
        as: 'bets',
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: db.User,
            as: 'user',
          },
        ],
      },
    ],
    distinct: true,
  })

  const lotIds = lots.map(l => l.id)

  const lotsBets = await lotRepository.countAllBetsByIds(lotIds)

  return lots.map((lot) => {
    const winner = lot.winner as User | undefined
    const category = lot.category as Category | undefined
    const bets = lot.bets || []

    return {
      ...createLotResource(lot),
      user: createUserResource(user),
      image: lot.image ? imageResource.create(lot.image) : null,
      winner: winner ? createUserResource(winner) : null,
      category: category ? categoryResource.create(category) : null,
      betsCount: lotsBets[lot.id],
      bets: bets.map(bet => ({
        ...createLotBetResource(bet),
        user: createUserResource(bet.user as User),
      })),
    }
  })
})
