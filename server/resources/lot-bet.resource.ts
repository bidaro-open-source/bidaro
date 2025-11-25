import type { LotBet } from '../database'

export type LotBetResource = ReturnType<typeof createLotBetResource>

export function createLotBetResource(entity: LotBet) {
  return {
    id: entity.id as number,
    amount: entity.amount,
  }
}
