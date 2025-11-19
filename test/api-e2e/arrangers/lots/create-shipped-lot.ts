import { lotStatuses } from '~~/server/constants'

interface Options {
  sellerId: number
  winnerId: number
  categoryId: number
}

/**
 * Creates new lot in database.
 *
 * @param options lot options
 * @returns lot instance with clear function
 */
export async function createShippedLot(options: Options) {
  const lot = await db.LotFactory.new().create({
    sellerId: options.sellerId,
    winnerId: options.winnerId,
    categoryId: options.categoryId,
    statusName: lotStatuses.IN_DELIVERY_PROCESS,
    initialPrice: db.LotFactory.initialPrice,
    currentPrice: db.LotFactory.initialPrice + 1000,
    initialDuration: db.LotFactory.initialDuration,
    effectiveDate: new Date(Date.now() - db.LotFactory.initialDurationInMs * 2),
    expirationDate: new Date(Date.now() - db.LotFactory.initialDurationInMs),
  })

  const bet = await db.LotBetFactory.new().create({
    lotId: lot.id,
    userId: options.winnerId,
    amount: lot.initialPrice + 1000,
  })

  const clear = async () => {
    await bet.destroy()
    await lot.destroy()
  }

  return { lot, clear }
}
