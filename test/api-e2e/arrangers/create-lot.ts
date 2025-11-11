import { lotStatuses } from '~~/server/constants'

interface Options {
  ownerId: number
}

/**
 * Creates new lot in database.
 *
 * @param options lot options
 * @returns lot instance with clear function
 */
export async function createLot(options: Options) {
  const lot = await db.LotFactory.new().create({
    userId: options.ownerId,
    statusName: lotStatuses.DRAFT,
    initialAmount: db.LotFactory.initialAmount,
    initialDuration: db.LotFactory.initialDuration,
  })

  const clear = () => lot.destroy()

  return { lot, clear }
}
