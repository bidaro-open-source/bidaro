import { lotStatuses } from '~~/server/constants'

interface Options {
  ownerId: number
}

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
