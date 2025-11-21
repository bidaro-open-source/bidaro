import { lotStatuses } from '../constants'
import { lotBetRepository } from '../repositories/lot-bet.repository'
import { lotRepository } from '../repositories/lot.repository'
import { userRepository } from '../repositories/user.repository'

export const lotBetService = {
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
   */
  async create(lotId: number, userId: number, amount: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByIdWithLock(lotId, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createError({
          statusCode: 404,
          message: 'Лот не знайдено',
        })
      }

      if (lot.statusName !== lotStatuses.IN_TRADING_PROCESS) {
        throw createError({
          statusCode: 400,
          message: 'Неможливо зробити ставку на лот, який не знаходиться в процесі торгів',
        })
      }

      if (!lot.expirationDate || lot.expirationDate <= new Date()) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Неможливо зробити ставку на лот',
        })
      }

      if (lot.currentPrice >= amount) {
        throw createError({
          statusCode: 400,
          message: 'Ставка повинна бути більшою за поточну ціну лоту',
        })
      }

      const user = await userRepository.findById(userId, { transaction })

      if (!user) {
        throw createError({
          statusCode: 404,
          message: 'Користувача не знайдено',
        })
      }

      if (user.id === lot.sellerId) {
        throw createError({
          statusCode: 400,
          message: 'Продавець не може робити ставки на власний лот',
        })
      }

      const bet = await lotBetRepository.create(
        { lotId, userId, amount },
        { transaction },
      )

      await lotRepository.updateById(
        lot.id,
        { currentPrice: amount },
        { transaction },
      )

      return bet
    })
  },
}
