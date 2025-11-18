import { lotStatuses } from '~~/server/constants'

interface Options {
  sellerId: number
  categoryId?: number | null
}

/**
 * Creates new lot in database.
 *
 * @param options lot options
 * @returns lot instance with clear function
 */
export async function createPublishedLot(options: Options) {
  const lot = await db.LotFactory.new().create({
    sellerId: options.sellerId,
    categoryId: options.categoryId ?? null,
    statusName: lotStatuses.IN_TRADING_PROCESS,
    initialPrice: db.LotFactory.initialPrice,
    initialDuration: db.LotFactory.initialDuration,
    effectiveDate: new Date(),
    expirationDate: new Date(Date.now() + db.LotFactory.initialDurationInMs),
  })

  const clear = () => lot.destroy()

  return { lot, clear }
}
