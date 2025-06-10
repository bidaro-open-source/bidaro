import type { LotBet } from '../database/models/LotBet'

/**
 * Bet steps - [amount, step][]
 */
const BET_STEPS = [
  [5, 1],
  [10, 2],
  [20, 3],
  [40, 5],
  [60, 6],
  [80, 8],
  [100, 10],
  [125, 12],
  [150, 15],
  [175, 18],
  [200, 25],
]

/**
 * Return the last bet amount for the lot
 *
 * @param lotId lot primary key
 */
export async function getLastBetAmount(lotId: number): Promise<number | null> {
  const db = useDatabase()

  const lastBet = await db.LotBet.findOne({
    where: { lotId },
    order: [['createdAt', 'DESC']],
  })

  return lastBet ? lastBet.amount : null
}

/**
 * Create lot bet
 *
 * @param id lot primary key
 * @param userId user primary key
 * @param amount amount of the bet
 * @returns lot bet instance
 * @throws 400 Bad Request if the bet amount is less than the last bet amount
 * @throws 404 Bad Request if the bet amount is less than the minimal bet step
 */
export async function createLotBet(
  id: number,
  userId: number,
  amount: number,
): Promise<LotBet> {
  const db = useDatabase()

  const lastBetAmount = await getLastBetAmount(id) || 0

  if (lastBetAmount >= amount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Ставка не може бути меншою за останню ставку',
    })
  }

  const minimalBetStep = calculateMinimalBetStep(lastBetAmount)

  if (amount - lastBetAmount < minimalBetStep) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Ставка не може бути меншою за мінімальний крок ставки',
    })
  }

  const bet = await db.LotBet.create({
    lotId: id,
    userId,
    amount,
  })

  return bet
}

/**
 * Calculate minimal step for the lot
 *
 * @param amount last bet amount
 * @returns step
 */
export function calculateMinimalBetStep(amount: number) {
  for (const [maxAmount, step] of BET_STEPS) {
    if (maxAmount >= amount) {
      return step
    }
  }

  return BET_STEPS[BET_STEPS.length - 1][1]
}
