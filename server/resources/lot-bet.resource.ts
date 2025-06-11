import type { LotBet } from '../database/models/LotBet'

export type LotBetResource = ReturnType<typeof createLotBetResource>

export function createLotBetResource(entity: LotBet) {
  return {
    id: ensureIncludedKey(entity, 'id') as number,
    amount: ensureIncludedKey(entity, 'amount'),
    createdAt: ensureIncludedKey(entity, 'createdAt'),
  }
}
