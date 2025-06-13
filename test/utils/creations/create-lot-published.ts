import type { LotBet } from '~~/server/database'
import { lotStatuses } from '~~/server/constants'

interface Options {
  ownerId: number
}

export async function createLotPublished(options: Options) {
  const lot = await db.LotFactory.new().create({
    userId: options.ownerId,
    statusName: lotStatuses.IN_TRADING_PROCESS,
    initialAmount: db.LotFactory.initialAmount,
    initialDuration: db.LotFactory.initialDuration,
    effectiveDate: new Date(),
    expirationDate: new Date(Date.now() + db.LotFactory.initialDurationInMs),
  })

  const initialBet: LotBet = await db.LotBetFactory.new().create({
    lotId: lot.id,
    userId: options.ownerId,
    amount: lot.initialAmount,
  })

  const clear = async () => {
    await initialBet.destroy()
    await lot.destroy()
  }

  return { lot, initialBet, clear }
}
