import type { Lot, User } from '../database'
import type { LotBet } from '../database/models/LotBet'

export type LotMinimalResource = ReturnType<typeof createLotMinimalResource>

export function createLotMinimalResource(entity: Lot) {
  const bets = ensureIncludedModel(entity, 'bets') as LotBet[]

  return {
    id: ensureIncludedKey(entity, 'id') as number,
    title: ensureIncludedKey(entity, 'title'),
    status: ensureIncludedKey(entity, 'statusName') as string,
    initialDuration: ensureIncludedKey(entity, 'initialDuration'),
    initialAmount: ensureIncludedKey(entity, 'initialAmount'),
    expirationDate: ensureIncludedKey(entity, 'expirationDate'),
    bets: bets.map((bet) => {
      const user = ensureIncludedModel(bet, 'user') as User

      return {
        id: ensureIncludedKey(bet, 'id') as number,
        amount: ensureIncludedKey(bet, 'amount'),
        user: {
          id: ensureIncludedKey(user, 'id') as number,
          name: ensureIncludedKey(user, 'name'),
          surname: ensureIncludedKey(user, 'surname'),
          username: ensureIncludedKey(user, 'username'),
        },
      }
    }),
  }
}
