import type { UserAttributes } from '#database'
import type { WhereOptions } from 'sequelize'
import { userRepository } from '#domains/users'
import { Op } from 'sequelize'
import { viewUsersRequest } from './index.get.request'
import { viewUsersPolicy } from './index.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  viewUsersPolicy(event)

  const request = await viewUsersRequest(event)

  const offset = (request.query.page - 1) * request.query.limit

  const whereClause: WhereOptions<UserAttributes> = {}

  if (request.query.search) {
    const sanitizedSearch = request.query.search.replace(/[%_]/g, '\\$&')
    const searchOperator = Op.iLike

    // @ts-expect-error - Sequelize types are being difficult here
    whereClause[Op.or] = [
      { name: { [searchOperator]: `%${sanitizedSearch}%` } },
      { surname: { [searchOperator]: `%${sanitizedSearch}%` } },
      { email: { [searchOperator]: `%${sanitizedSearch}%` } },
      { username: { [searchOperator]: `%${sanitizedSearch}%` } },
    ]
  }

  if (request.query.filter === 'verified') {
    whereClause.emailVerifiedAt = { [Op.ne]: null }
  }

  if (request.query.filter === 'unverified') {
    whereClause.emailVerifiedAt = { [Op.eq]: null }
  }

  const { rows, count } = await userRepository.findAllAndCount({
    limit: request.query.limit,
    offset,
    where: whereClause,
    order: [[request.query.sortBy, request.query.sortOrder]],
  })

  return {
    data: rows.map(row => ({
      id: row.id,
      name: row.name,
      surname: row.surname,
      username: row.username,
      email: row.email,
      emailVerifiedAt: row.emailVerifiedAt,
      roleName: row.roleName,
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
