import type { LotAttributes } from '#database'
import type { WhereOptions } from 'sequelize'
import { lotCatalogRepository, lotResource } from '#domains/auction'
import { categoryResource, categorySource } from '#domains/categories'
import { imageResource } from '#domains/storage'
import { userResource } from '#domains/users'
import { createAppError } from '#utils/create-app-error'
import { Op } from 'sequelize'
import { lotStatuses } from '~~/server/constants'
import { viewCatalogRequest } from './index.get.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 40,
    anonymousLimit: 200,
  })

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
        throw createAppError('LOT_SELLER_NOT_FOUND')
      }

      return {
        ...lotResource.make(lot),
        cover: imageResource.make(lot.cover?.image),
        category: categoryResource.make(lot.category),
        seller: userResource.make(lot.seller),
        winner: userResource.make(lot.winner),
      }
    }),
  }
})
