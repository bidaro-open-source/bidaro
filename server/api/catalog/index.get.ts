import type { WhereOptions } from 'sequelize'
import type { LotAttributes } from '~~/server/database'
import { Op } from 'sequelize'
import { lotStatuses } from '~~/server/constants'
import { createImageResource, createLotResource, lotCatalogRepository } from '~~/server/domains/auction'
import { categorySource, createCategoryResource } from '~~/server/domains/categories'
import { createUserResource } from '~~/server/domains/users'
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

  const { rows, count } = await lotCatalogRepository.findAllForCatalog({
    limit: request.query.limit,
    offset,
    where: whereClause,
    categoryPath,
  })

  return {
    meta: {
      totalItems: count,
      currentPage: request.query.page,
      itemsPerPage: request.query.limit,
    },
    data: rows.map((lot) => {
      if (!lot.seller) {
        throw createError({
          message: 'Продавця лоту не знайдено',
          status: 500,
        })
      }

      return {
        ...createLotResource(lot),
        cover: lot.cover?.image ? createImageResource(lot.cover?.image) : null,
        category: lot.category ? createCategoryResource(lot.category) : null,
        seller: createUserResource(lot.seller),
        winner: lot.winner ? createUserResource(lot.winner) : null,
      }
    }),
  }
})
