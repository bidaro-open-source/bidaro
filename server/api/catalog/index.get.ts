import type { WhereOptions } from 'sequelize'
import type { LotAttributes } from '~~/server/database'
import { Op } from 'sequelize'
import { lotStatuses } from '~~/server/constants'
import { lotCatalogSource } from '~~/server/domains/auction'
import { categorySource } from '~~/server/domains/categories'
import { viewCatalogRequest } from './index.get.request'

export default defineEventHandler(async (event) => {
  const request = await viewCatalogRequest(event)

  const offset = (request.query.page - 1) * request.query.limit

  const whereClause: WhereOptions<LotAttributes> = {
    statusName: { [Op.eq]: lotStatuses.IN_TRADING_PROCESS },
    expirationDate: { [Op.gt]: new Date() },
  }

  let categoryPath: string | undefined

  if (request.query.category_slug) {
    const category = await categorySource.getBySlug(request.query.category_slug)
    categoryPath = category.path
  }

  const { rows, count } = await lotCatalogSource.getAllForCatalog({
    limit: request.query.limit,
    offset,
    where: whereClause,
    categoryPath,
  })

  return {
    data: rows,
    meta: {
      totalItems: count,
      currentPage: request.query.page,
      itemsPerPage: request.query.limit,
    },
  }
})
