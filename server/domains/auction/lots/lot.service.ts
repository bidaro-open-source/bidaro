import type { Lot } from '#database'
import { createAppError } from '#utils/create-app-error'
import { lotInitialDurations, lotInitialDurationsInMs, lotStatuses } from '../../../constants'
import { categoryRepository } from '../../categories'
import { lotBetRepository } from '../bets/lot-bet.repository'
import { lotRepository } from './lot.repository'
import { lotSource } from './lot.source'

class LotService {
  /**
   * Creates a draft lot for the given seller.
   *
   * @param sellerId seller primary key
   * @returns created lot instance
   */
  async createDraft(sellerId: number) {
    const lot = await lotRepository.create({
      title: 'Чернетка',
      initialPrice: 1,
      currentPrice: 1,
      initialDuration: lotInitialDurations.THREE_DAYS,
      statusName: lotStatuses.DRAFT,
      sellerId,
    })

    return lot
  }

  /**
   * Updates a lot.
   *
   * @param id lot primary key
   * @param updates lot properties
   * @throws 400 when lot is not editable
   * @throws 400 when category does not exist
   * @returns updated lot instance
   * @throws CATEGORY_NOT_FOUND
   * @throws LOT_INVALID_STATUS
   * @throws LOT_NOT_FOUND
   */
  async update(id: number, updates: Partial<Lot>) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createAppError('LOT_NOT_FOUND')
      }

      const editableStatuses: string[] = [lotStatuses.DRAFT, lotStatuses.IN_TRADING_PROCESS]

      if (!editableStatuses.includes(lot.statusName)) {
        throw createAppError('LOT_INVALID_STATUS')
      }

      const title = updates.title ?? lot.title
      const description = updates.description ?? lot.description
      let initialPrice = lot.initialPrice
      let initialDuration = lot.initialDuration
      let categoryId = lot.categoryId

      if (lot.statusName === lotStatuses.DRAFT) {
        initialPrice = updates.initialPrice ?? initialPrice
        initialDuration = updates.initialDuration ?? initialDuration
      }

      if (updates.categoryId) {
        const category = await categoryRepository.findByPk(
          updates.categoryId,
          { transaction },
        )

        if (!category) {
          throw createAppError('CATEGORY_NOT_FOUND')
        }

        categoryId = category.id
      }

      const updatedLot = await lotRepository.updateByPk(id, {
        title,
        description,
        initialPrice,
        initialDuration,
        categoryId,
      }, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.update', async () => {
        await lotSource.invalidate([lot, updatedLot])
      })

      return updatedLot
    })
  }

  /**
   * Publishes a lot.
   *
   * @param id lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is already published
   * @throws 400 when lot category is not set
   * @returns updated lot instance
   * @throws BAD_REQUEST
   * @throws LOT_INVALID_STATUS
   * @throws LOT_NOT_FOUND
   */
  async publish(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createAppError('LOT_NOT_FOUND')
      }

      if (lot.statusName !== lotStatuses.DRAFT) {
        throw createAppError('LOT_INVALID_STATUS')
      }

      if (!lot.categoryId) {
        throw createAppError('BAD_REQUEST')
      }

      const updatedLot = await lotRepository.updateByPk(id, {
        statusName: lotStatuses.IN_TRADING_PROCESS,
        effectiveDate: new Date(),
        expirationDate: new Date(Date.now() + lotInitialDurationsInMs[lot.initialDuration]),
      }, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.publish', async () => {
        await lotSource.invalidate([lot, updatedLot])
      })

      return updatedLot
    })
  }

  /**
   * Closes a lot.
   *
   * @param id lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is not in trading process status
   * @throws 400 when lot expiration date is not reached
   * @returns updated lot instance
   * @throws BAD_REQUEST
   * @throws LOT_INVALID_STATUS
   * @throws LOT_NOT_FOUND
   */
  async close(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createAppError('LOT_NOT_FOUND')
      }

      if (lot.statusName !== lotStatuses.IN_TRADING_PROCESS) {
        throw createAppError('LOT_INVALID_STATUS')
      }

      if (!lot.expirationDate || lot.expirationDate > new Date()) {
        throw createAppError('BAD_REQUEST')
      }

      const latestBet = await lotBetRepository.findLatestByLotId(lot.id)

      const updatedLot = await lotRepository.updateByPk(lot.id, {
        winnerId: latestBet
          ? latestBet.userId
          : null,
        statusName: latestBet
          ? lotStatuses.IN_DISCUSSION_PROCESS
          : lotStatuses.REJECTED,
      }, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.close', async () => {
        await lotSource.invalidate([lot, updatedLot])
      })

      return updatedLot
    })
  }

  /**
   * Ships a lot.
   *
   * @param id - lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is not in discussion process status
   * @returns updated lot instance
   * @throws LOT_INVALID_STATUS
   * @throws LOT_NOT_FOUND
   */
  async ship(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createAppError('LOT_NOT_FOUND')
      }

      if (lot.statusName !== lotStatuses.IN_DISCUSSION_PROCESS) {
        throw createAppError('LOT_INVALID_STATUS')
      }

      const updatedLot = await lotRepository.updateByPk(lot.id, {
        statusName: lotStatuses.IN_DELIVERY_PROCESS,
      }, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.ship', async () => {
        await lotSource.invalidate([lot, updatedLot])
      })

      return updatedLot
    })
  }

  /**
   * Receives a lot.
   *
   * @param id lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is not in delivery process status
   * @returns updated lot instance
   * @throws LOT_INVALID_STATUS
   * @throws LOT_NOT_FOUND
   */
  async receive(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createAppError('LOT_NOT_FOUND')
      }

      if (lot.statusName !== lotStatuses.IN_DELIVERY_PROCESS) {
        throw createAppError('LOT_INVALID_STATUS')
      }

      const updatedLot = await lotRepository.updateByPk(lot.id, {
        statusName: lotStatuses.RECEIVED,
      }, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.receive', async () => {
        await lotSource.invalidate([lot, updatedLot])
      })

      return updatedLot
    })
  }

  /**
   * Deletes a lot.
   *
   * @param id lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is not in draft status
   * @throws LOT_INVALID_STATUS
   * @throws LOT_NOT_FOUND
   */
  async delete(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createAppError('LOT_NOT_FOUND')
      }

      if (lot.statusName !== lotStatuses.DRAFT) {
        throw createAppError('LOT_INVALID_STATUS')
      }

      await lotRepository.destroyByPk(lot.id, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.delete', async () => {
        await lotSource.invalidate(lot)
      })
    })
  }
}

export const lotService = new LotService()
