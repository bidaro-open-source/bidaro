import type { WhereOptions } from 'sequelize'
import type { LotAttributes } from '~~/server/database'
import { Op } from 'sequelize'
import { lotStatuses } from '~~/server/constants'
import { lotRepository } from '~~/server/domains/auction'
import { categoryRepository } from '~~/server/domains/categories'
import { viewCatalogRequest } from './index.get.request'

export default defineEventHandler(async (event) => {
  const request = await viewCatalogRequest(event)

  const offset = (request.query.page - 1) * request.query.limit

  const whereClause: WhereOptions<LotAttributes> = {
    statusName: { [Op.eq]: lotStatuses.IN_TRADING_PROCESS },
    expirationDate: { [Op.gt]: new Date() },
  }

  if (request.query.category_slug) {
    const category = await categoryRepository.findBySlug(request.query.category_slug)

    if (!category) {
      throw createError({
        message: 'Категорію не знайдено',
        statusCode: 404,
      })
    }

    const db = useDatabase()

    const categoryIds = await db.Category.findAll({
      attributes: ['id'],
      where: {
        path: {
          [Op.like]: `${category.path}%`,
        },
      },
    }).then(categories => categories.map(c => c.id))

    whereClause.categoryId = { [Op.in]: categoryIds }
  }

  const { rows, count } = await lotRepository.findAllAndCount({
    limit: request.query.limit,
    offset,
    where: whereClause,
    order: [['expirationDate', 'ASC']],
  })

  return {
    data: rows.map(row => ({
      id: row.id,
      sellerId: row.sellerId,
      winnerId: row.winnerId,
      categoryId: row.categoryId,
      title: row.title,
      description: row.description,
      statusName: row.statusName,
      initialPrice: row.initialPrice,
      currentPrice: row.currentPrice,
      effectiveDate: row.effectiveDate,
      expirationDate: row.expirationDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
    meta: {
      totalItems: count,
      currentPage: request.query.page,
      itemsPerPage: request.query.limit,
    },
  }
})
