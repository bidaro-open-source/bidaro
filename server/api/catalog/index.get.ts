import type { WhereOptions } from 'sequelize'
import type { LotAttributes } from '~~/server/database'
import { Op } from 'sequelize'
import { lotStatuses } from '~~/server/constants'
import { createLotResource, lotRepository } from '~~/server/domains/auction'
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

    const categoryIds = await categoryRepository.findIdsByPath(category.path)

    whereClause.categoryId = { [Op.in]: categoryIds }
  }

  const { rows, count } = await lotRepository.findAllAndCount({
    limit: request.query.limit,
    offset,
    where: whereClause,
    order: [['expirationDate', 'ASC']],
  })

  return {
    data: rows.map(createLotResource),
    meta: {
      totalItems: count,
      currentPage: request.query.page,
      itemsPerPage: request.query.limit,
    },
  }
})
