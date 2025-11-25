import type { Lot } from '../database'
import { lotInitialDurations, lotInitialDurationsInMs, lotStatuses } from '../constants'
import { categoryRepository } from '../repositories/category.repository'
import { lotBetRepository } from '../repositories/lot-bet.repository'
import { lotRepository } from '../repositories/lot.repository'
import { lotSource } from '../sources/lot.source'

export const lotService = {
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
  },

  /**
   * Updates a lot.
   *
   * @param id lot primary key
   * @param updates lot properties
   * @throws 400 when lot is not editable
   * @throws 400 when category does not exist
   * @returns updated lot instance
   */
  async update(id: number, updates: Partial<Lot>) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createError({
          statusCode: 404,
          message: 'Лот не знайдено',
        })
      }

      const editableStatuses: string[] = [lotStatuses.DRAFT, lotStatuses.IN_TRADING_PROCESS]

      if (!editableStatuses.includes(lot.statusName)) {
        throw createError({
          statusCode: 400,
          message: 'Лот не може бути змінений у поточному статусі',
        })
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
        const category = await categoryRepository.findById(
          updates.categoryId,
          { transaction },
        )

        if (!category) {
          throw createError({
            statusCode: 400,
            message: 'Вказана категорія не існує',
          })
        }

        categoryId = category.id
      }

      const updatedLot = await lotRepository.updateById(id, {
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
  },

  /**
   * Publishes a lot.
   *
   * @param id lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is already published
   * @throws 400 when lot category is not set
   * @returns updated lot instance
   */
  async publish(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createError({
          statusCode: 404,
          message: 'Лот не знайдено',
        })
      }

      if (lot.statusName !== lotStatuses.DRAFT) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Лот вже опубліковано',
        })
      }

      if (!lot.categoryId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Категорія лоту не встановлена',
        })
      }

      const updatedLot = await lotRepository.updateById(id, {
        statusName: lotStatuses.IN_TRADING_PROCESS,
        effectiveDate: new Date(),
        expirationDate: new Date(Date.now() + lotInitialDurationsInMs[lot.initialDuration]),
      }, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.publish', async () => {
        await lotSource.invalidate([lot, updatedLot])
      })

      return updatedLot
    })
  },

  /**
   * Closes a lot.
   *
   * @param id lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is not in trading process status
   * @throws 400 when lot expiration date is not reached
   * @returns updated lot instance
   */
  async close(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByIdWithLock(id, {
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
          statusMessage: 'Bad Request',
          message: 'Лот не може бути закритий у поточному статусі',
        })
      }

      if (!lot.expirationDate || lot.expirationDate > new Date()) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Лот не може бути закритий до завершення терміну дії',
        })
      }

      const latestBet = await lotBetRepository.findLatestByLotId(lot.id)

      const updatedLot = await lotRepository.updateById(lot.id, {
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
  },

  /**
   * Ships a lot.
   *
   * @param id - lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is not in discussion process status
   * @returns updated lot instance
   */
  async ship(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createError({
          statusCode: 404,
          message: 'Лот не знайдено',
        })
      }

      if (lot.statusName !== lotStatuses.IN_DISCUSSION_PROCESS) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Лот не може бути відправлений у поточному статусі',
        })
      }

      const updatedLot = await lotRepository.updateById(lot.id, {
        statusName: lotStatuses.IN_DELIVERY_PROCESS,
      }, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.ship', async () => {
        await lotSource.invalidate([lot, updatedLot])
      })

      return updatedLot
    })
  },

  /**
   * Receives a lot.
   *
   * @param id lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is not in delivery process status
   * @returns updated lot instance
   */
  async receive(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createError({
          statusCode: 404,
          message: 'Лот не знайдено',
        })
      }

      if (lot.statusName !== lotStatuses.IN_DELIVERY_PROCESS) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Лот не може бути отриманий у поточному статусі',
        })
      }

      const updatedLot = await lotRepository.updateById(lot.id, {
        statusName: lotStatuses.RECEIVED,
      }, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.receive', async () => {
        await lotSource.invalidate([lot, updatedLot])
      })

      return updatedLot
    })
  },

  /**
   * Deletes a lot.
   *
   * @param id lot primary key
   * @throws 404 when lot not found
   * @throws 400 when lot is not in draft status
   */
  async delete(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createError({
          statusCode: 404,
          message: 'Лот не знайдено',
        })
      }

      if (lot.statusName !== lotStatuses.DRAFT) {
        throw createError({
          message: 'Цей лот не може бути видалений, оскільки він вже опублікований',
          status: 400,
        })
      }

      await lotRepository.destroyById(lot.id, { transaction })

      useDatabaseAfterCommit(transaction, 'lot.service.close', async () => {
        await lotSource.invalidate(lot)
      })
    })
  },
}
