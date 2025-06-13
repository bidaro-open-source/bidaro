import type { LotBet } from '~~/server/database'
import { lotStatuses } from '~~/server/constants'

interface Options {
  ownerId: number
  winnderId: number
}

export async function createLotShipped(options: Options) {
  const lot = await db.LotFactory.new().create({
    userId: options.ownerId,
    statusName: lotStatuses.IN_DELIVERY_PROCESS,
    initialAmount: db.LotFactory.initialAmount,
    initialDuration: db.LotFactory.initialDuration,
    effectiveDate: new Date(Date.now() - db.LotFactory.initialDurationInMs * 2),
    expirationDate: new Date(Date.now() - db.LotFactory.initialDurationInMs),
  })

  const initialBet: LotBet = await db.LotBetFactory.new().create({
    lotId: lot.id,
    userId: options.ownerId,
    amount: lot.initialAmount,
  })

  const winnerBet: LotBet = await db.LotBetFactory.new().create({
    lotId: lot.id,
    userId: options.winnderId,
    amount: lot.initialAmount + 100,
  })

  const clear = async () => {
    await winnerBet.destroy()
    await initialBet.destroy()
    await lot.destroy()
  }

  return { lot, initialBet, winnerBet, clear }
}
