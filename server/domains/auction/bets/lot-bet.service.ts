import { lotStatuses } from '~~/server/constants'
import { userRepository } from '../../users'
import { lotRepository } from '../lots/lot.repository'
import { lotSource } from '../lots/lot.source'
import { lotBetRepository } from './lot-bet.repository'

class LotBetService {
  /**
   * Creates a lot bet.
   *
   * @param lotId lot primary key
   * @param userId user primary key
   * @param amount bet amount
   * @returns created lot bet instance
   * @throws LOT_NOT_FOUND
   * @throws LOT_INVALID_STATUS
   * @throws LOT_BET_TOO_LOW
   * @throws USER_NOT_FOUND
   * @throws LOT_BET_OWNER_IS_SELLER
   */
  async create(lotId: number, userId: number, amount: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(lotId, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createAppError('LOT_NOT_FOUND', {
          id: lotId,
        })
      }

      if (lot.statusName !== lotStatuses.IN_TRADING_PROCESS) {
        throw createAppError('LOT_INVALID_STATUS', {
          currentStatus: lot.statusName,
          requiredStatus: lotStatuses.IN_TRADING_PROCESS,
        })
      }

      if (!lot.expirationDate || lot.expirationDate <= new Date()) {
        throw createAppError('LOT_INVALID_STATUS', {
          currentStatus: lot.statusName,
          requiredStatus: lotStatuses.IN_TRADING_PROCESS,
        })
      }

      if (lot.currentPrice >= amount) {
        throw createAppError('LOT_BET_TOO_LOW', {
          lotPrice: lot.currentPrice,
          betAmount: amount,
        })
      }

      const user = await userRepository.findByPk(userId, { transaction })

      if (!user) {
        throw createAppError('USER_NOT_FOUND', {
          id: userId,
        })
      }

      if (user.id === lot.sellerId) {
        throw createAppError('LOT_BET_OWNER_IS_SELLER', {
          userId: user.id,
          sellerId: lot.sellerId,
        })
      }

      const bet = await lotBetRepository.create(
        { lotId, userId, amount },
        { transaction },
      )

      await lotRepository.updateByPk(
        lot.id,
        { currentPrice: amount },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'lot-bet.service.create', async () => {
        await lotSource.invalidate(lot)
      })

      return bet
    })
  }
}

export const lotBetService = new LotBetService()
