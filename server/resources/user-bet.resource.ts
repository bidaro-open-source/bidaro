import type { Lot, User } from '../database'
import type { LotBet } from '../database/models/LotBet'

export type UserBetResource = ReturnType<typeof createUserBetResource>

export function createUserBetResource(entity: LotBet) {
  const lot = ensureIncludedModel(entity, 'lot') as Lot
  const bets = lot ? ensureIncludedModel(lot, 'bets') as LotBet[] : []

  return {
    id: ensureIncludedKey(entity, 'id') as number,
    amount: ensureIncludedKey(entity, 'amount'),
    createdAt: ensureIncludedKey(entity, 'createdAt'),
    lot: {
      id: ensureIncludedKey(lot, 'id') as number,
      title: ensureIncludedKey(lot, 'title'),
      status: ensureIncludedKey(lot, 'statusName'),
      expirationDate: ensureIncludedKey(lot, 'expirationDate'),
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
    },
  }
}
