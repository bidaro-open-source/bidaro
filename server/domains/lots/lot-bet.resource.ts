import type { LotBetAttributes } from '../../database'

export type LotBetResource = ReturnType<typeof createLotBetResource>

export function createLotBetResource(entity: LotBetAttributes) {
  return {
    id: entity.id as number,
    amount: entity.amount,
  }
}
