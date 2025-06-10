import type { Lot, LotAttributes } from '../database'
import { Op } from 'sequelize'

/**
 * Options for fetching lot
 */
interface GetLotOptions {
  withUser?: boolean
}

/**
 * Fetch lot by the primary key
 *
 * @param id lot primary key
 * @param options fetch options
 * @returns lot instance
 */
export async function getLot(
  id: number,
  options: GetLotOptions = {},
): Promise<Lot> {
  const db = useDatabase()
  const include = []

  if (options.withUser) {
    include.push({ model: db.User, as: 'user' })
  }

  const lot = await db.Lot.findByPk(id, { include })

  if (!lot) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  return lot
}

/**
 * Fetch lot by the primary key for the user
 *
 * @param id lot primary key
 * @param userId user primary key
 * @param options fetch options
 * @returns lot instance
 */
export async function getUserLot(
  id: number,
  userId: number,
  options: GetLotOptions = {},
): Promise<Lot> {
  const db = useDatabase()
  const include = []

  if (options.withUser) {
    include.push({ model: db.User, as: 'user' })
  }

  const lot = await db.Lot.findByPk(id, { include })

  if (!lot || lot.userId !== userId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Лот не знайдено',
    })
  }

  return lot
}

/**
 * Fetch all lots of the user
 *
 * @param userId user primary key
 * @param options fetch options
 * @returns lot instance
 */
export async function getUserLots(
  userId: number,
  options: GetLotOptions = {},
): Promise<Lot[]> {
  const db = useDatabase()
  const include = []

  if (options.withUser) {
    include.push({ model: db.User, as: 'user' })
  }

  return await db.Lot.findAll({ include, where: { userId } })
}

/**
 * Fetch all lots of the user
 *
 * @param userId user primary key
 * @param options fetch options
 * @returns lot instance
 */
export async function getPublishedUserLots(
  userId: number,
  options: GetLotOptions = {},
): Promise<Lot[]> {
  const db = useDatabase()
  const include = []

  if (options.withUser) {
    include.push({ model: db.User, as: 'user' })
  }

  const lots = await db.Lot.findAll({
    include,
    where: {
      userId,
      statusName: {
        [Op.ne]: 'draft',
      },
    },
  })

  return lots
}

/**
 * Update lot data
 *
 * @param lot lot instance
 * @param fields fields to update
 * @returns updated lot instance
 */
export function updateLotData(
  lot: Lot,
  fields: Partial<Pick<LotAttributes, 'title' | 'description'>>,
): Lot {
  if (fields.title) {
    lot.title = fields.title
  }

  if (fields.description) {
    lot.description = fields.description
  }

  return lot
}

/**
 * Update lot duration
 *
 * If the lot is in the draft status, then the duration is updated.
 * Otherwise, an error is thrown.
 *
 * @param lot lot instance
 * @param duration duration of the lot by text value
 * @returns updated lot instance
 * @throws if the lot is not in the draft status
 */
export function updateLotDuration(
  lot: Lot,
  duration?: string,
): Lot {
  console.log(duration)
  if (!duration)
    return lot

  if (lot.statusName !== 'draft') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Час лоту не може бути оновлений, оскільки він вже опублікований',
    })
  }

  const durationInMs = calculateLotDuration(duration)

  lot.duration = durationInMs

  return lot
}

/**
 * Update lot status to 'in_trading_process'
 *
 * @param lot lot instance
 * @returns updated lot instance
 * @throws if the lot is not in the `draft` status
 */
export function updateLotStatusToPublished(
  lot: Lot,
): Lot {
  if (lot.statusName !== 'draft') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот вже опублікований',
    })
  }

  lot.startDate = new Date()
  lot.endDate = new Date(new Date().getTime() + lot.duration)
  lot.statusName = 'in_trading_process'

  return lot
}

/**
 * Update lot status to 'in_discussion_process'
 *
 * @param lot lot instance
 * @returns updated lot instance
 * @throws if the lot is not in the `in_trading_process` status
 */
export function updateLotStatusToDiscussion(
  lot: Lot,
): Lot {
  if (lot.statusName !== 'in_trading_process') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот не в процесі торгів',
    })
  }

  lot.statusName = 'in_discussion_process'

  return lot
}

/**
 * Update lot status to 'in_delivery_process'
 *
 * @param lot lot instance
 * @returns updated lot instance
 * @throws if the lot is not in the `in_discussion_process` status
 */
export function updateLotStatusToShipment(
  lot: Lot,
): Lot {
  if (lot.statusName !== 'in_discussion_process') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот не в процесі обговорення',
    })
  }

  lot.statusName = 'in_delivery_process'

  return lot
}

/**
 * Update lot status to 'received'
 *
 * @param lot lot instance
 * @returns updated lot instance
 * @throws if the lot is not in the `in_delivery_process` status
 */
export function updateLotStatusToReceived(
  lot: Lot,
): Lot {
  if (lot.statusName !== 'in_delivery_process') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Лот не в процесі доставки',
    })
  }

  lot.statusName = 'received'

  return lot
}

/**
 * Update lot status to 'rejected'
 *
 * @param lot lot instance
 * @returns updated lot instance
 */
export function updateLotStatusToRejected(
  lot: Lot,
): Lot {
  lot.statusName = 'rejected'
  return lot
}

/**
 * Calculate the interval in ms for the lot based on the text duration.
 *
 * @param duration duration of the lot by text value
 * @returns duration in milliseconds
 */
export function calculateLotDuration(duration: string): number {
  switch (duration) {
    case '1_hour':
      return 3600000
    case '1_day':
      return 86400000
    case '3_days':
      return 259200000
    case '7_days':
      return 604800000
    default:
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: `Unknown duration: ${duration}`,
      })
  }
}

/**
 * Calculate the interval in ms for the lot based on the text duration.
 *
 * @param duration duration of the lot by text value
 * @returns duration in milliseconds
 */
export function normalizeLotDuration(duration: number): string {
  switch (`${duration}`) {
    case '3600000':
      return '1_hour'
    case '86400000':
      return '1_day'
    case '259200000':
      return '3_days'
    case '604800000':
      return '7_days'
    default:
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: `Unknown duration: ${duration}`,
      })
  }
}
