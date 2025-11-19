import type { LotBet } from '~~/server/database'
import { lotStatuses } from '~~/server/constants'

interface Options {
  sellerId: number
  categoryId: number
  winnerId?: number
}

/**
 * Creates new lot in database.
 *
 * @param options lot options
 * @returns lot instance with clear function
 */
export async function createReadyForClosingLot(options: Options) {
  const lot = await db.LotFactory.new().create({
    sellerId: options.sellerId,
    categoryId: options.categoryId,
    statusName: lotStatuses.IN_TRADING_PROCESS,
    initialPrice: db.LotFactory.initialPrice,
    initialDuration: db.LotFactory.initialDuration,
    currentPrice: db.LotFactory.initialPrice,
    effectiveDate: new Date(Date.now() - db.LotFactory.initialDurationInMs * 2),
    expirationDate: new Date(Date.now() - db.LotFactory.initialDurationInMs),
  })

  let bet: LotBet | null = null

  if (options.winnerId) {
    bet = await db.LotBetFactory.new().create({
      lotId: lot.id,
      userId: options.winnerId,
      amount: lot.initialPrice + 1000,
    })

    lot.currentPrice = bet.amount

    await lot.save()
  }

  const clear = async () => {
    await bet?.destroy()
    await lot.destroy()
  }

  return { lot, clear }
}
