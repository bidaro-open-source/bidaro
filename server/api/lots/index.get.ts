import type { LotAttributes } from '#database'
import type { WhereOptions } from 'sequelize'
import { lotRepository } from '#domains/auction'
import { Op } from 'sequelize'
import { lotStatuses } from '~~/server/constants'
import { viewLotsRequest } from './index.get.request'
import { viewLotsPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  viewLotsPolicy(event)

  const request = await viewLotsRequest(event)

  const offset = (request.query.page - 1) * request.query.limit

  const whereClause: WhereOptions<LotAttributes> = {}

  if (request.query.search) {
    const sanitizedSearch = request.query.search.replace(/[%_]/g, '\\$&')
    const searchOperator = Op.iLike

    // @ts-expect-error - Sequelize types are being difficult here
    whereClause[Op.or] = [
      { title: { [searchOperator]: `%${sanitizedSearch}%` } },
    ]
  }

  if (request.query.filter === 'published') {
    whereClause.statusName = { [Op.eq]: lotStatuses.IN_TRADING_PROCESS }
  }

  if (request.query.filter === 'closed') {
    whereClause.statusName = { [Op.eq]: lotStatuses.IN_DISCUSSION_PROCESS }
  }

  if (request.query.filter === 'shipped') {
    whereClause.statusName = { [Op.eq]: lotStatuses.IN_DELIVERY_PROCESS }
  }

  if (request.query.filter === 'drafted') {
    whereClause.statusName = { [Op.eq]: lotStatuses.DRAFT }
  }

  if (request.query.filter === 'completed') {
    whereClause.statusName = { [Op.eq]: lotStatuses.RECEIVED }
  }

  if (request.query.filter === 'rejected') {
    whereClause.statusName = { [Op.eq]: lotStatuses.REJECTED }
  }

  const { rows, count } = await lotRepository.findAllAndCount({
    limit: request.query.limit,
    offset,
    where: whereClause,
    order: [[request.query.sortBy, request.query.sortOrder]],
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
