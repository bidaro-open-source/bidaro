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
   * @throws 404 when lot or user not found
   * @throws 400 when lot is not in trading process
   * @throws 400 when lot is expired
   * @throws 400 when bet amount is not higher than current lot price
   * @throws BAD_REQUEST
   * @throws LOT_BET_TOO_LOW
   * @throws LOT_INVALID_STATUS
   * @throws LOT_NOT_FOUND
   * @throws USER_NOT_FOUND
   */
  async create(lotId: number, userId: number, amount: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(lotId, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createAppError('LOT_NOT_FOUND')
      }

      if (lot.statusName !== lotStatuses.IN_TRADING_PROCESS) {
        throw createAppError('LOT_INVALID_STATUS')
      }

      if (!lot.expirationDate || lot.expirationDate <= new Date()) {
        throw createAppError('LOT_INVALID_STATUS')
      }

      if (lot.currentPrice >= amount) {
        throw createAppError('LOT_BET_TOO_LOW')
      }

      const user = await userRepository.findByPk(userId, { transaction })

      if (!user) {
        throw createAppError('USER_NOT_FOUND')
      }

      if (user.id === lot.sellerId) {
        throw createAppError('BAD_REQUEST')
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
