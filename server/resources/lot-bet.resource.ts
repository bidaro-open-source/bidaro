import type { User } from '../database'
import type { LotBet } from '../database/models/LotBet'

export type LotBetResource = ReturnType<typeof createLotBetResource>

export function createLotBetResource(entity: LotBet) {
  const user = ensureIncludedModel(entity, 'user') as User

  return {
    id: ensureIncludedKey(entity, 'id') as number,
    lotId: ensureIncludedKey(entity, 'lotId') as number,
    amount: ensureIncludedKey(entity, 'amount') as number,
    createdAt: ensureIncludedKey(entity, 'createdAt') as Date,
    user: {
      id: ensureIncludedKey(user, 'id') as number,
      name: ensureIncludedKey(user, 'name'),
      surname: ensureIncludedKey(user, 'surname'),
      username: ensureIncludedKey(user, 'username'),
    },
  }
}
