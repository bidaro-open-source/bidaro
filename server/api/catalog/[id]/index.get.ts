import type { User } from '~~/server/database'
import type { Category } from '~~/server/database/models/Category'
import { Op } from 'sequelize'
import { lotStatuses } from '~~/server/constants'
import { categoryRepository } from '~~/server/repositories/category.repository'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { getCatalogByCategoryRequest } from '~~/server/requests/catalog.request'
import { categoryResource } from '~~/server/resources/category.resource'
import { createLotBetResource } from '~~/server/resources/lot-bet.resource'
import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserResource } from '~~/server/resources/user.resource'

export default defineEventHandler(async (event) => {
  const request = await getCatalogByCategoryRequest(event)

  const category = await categoryRepository.findTreeByParentId(request.params.id)

  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Категорія не знайдена',
    })
  }

  const ids: number[] = []

  const addIds = (category: Category) => {
    ids.push(category.id)
    if (category.children) {
      category.children.forEach(addIds)
    }
  }

  category.forEach(addIds)

  const db = useDatabase()

  const page = request.query.page || 1
  const limit = request.query.limit || 28

  const now = new Date()

  const { count, rows } = await db.Lot.findAndCountAll({
    limit,
    offset: (page - 1) * limit,
    where: {
      statusName: lotStatuses.IN_TRADING_PROCESS,
      categoryId: { [Op.in]: ids },
      effectiveDate: { [Op.lt]: now },
      expirationDate: { [Op.gt]: now },
    },
    order: [['expirationDate', 'ASC']],
    include: [
      {
        model: db.User,
        as: 'user',
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
        limit: 1,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: db.User,
            as: 'user',
          },
        ],
      },
    ],
  })

  const lotIds = rows.map(lot => lot.id)

  const lotsBetsCounts = await lotRepository.countAllBetsByIds(lotIds)

  return {
    data: rows.map((lot) => {
      const user = lot.user as User
      const winner = lot.winner as User | null
      const category = lot.category as Category | null
      const bets = lot.bets || []

      return {
        ...createLotResource(lot),
        user: createUserResource(user),
        winner: winner ? createUserResource(winner) : null,
        category: category ? categoryResource.create(category) : null,
        betsCount: lotsBetsCounts[lot.id],
        bets: bets.map(bet => ({
          ...createLotBetResource(bet),
          user: createUserResource(bet.user as User),
        })),
      }
    }),
    meta: {
      total: count,
      perPage: limit,
      currentPage: page,
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, count),
    },
  }
})
