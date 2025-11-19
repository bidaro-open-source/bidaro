import type { Lot } from '../database'
import { lotInitialDurations, lotInitialDurationsInMs, lotStatuses } from '../constants'
import { lotBetRepository } from '../repositories/lot-bet.repository'
import { lotRepository } from '../repositories/lot.repository'
import { categoryService } from './category.service'

export const lotService = {
  /**
   * Returns a lot instance or throw.
   *
   * @param id lot primary key
   * @throws 404 when lot not found
   * @returns lot instance
   */
  async findByIdOrFail(id: number) {
    const lot = await lotRepository.findById(id)

    if (!lot) {
      throw createError({
        message: 'Лот не знайдено',
        status: 404,
      })
    }

    return lot
  },

  /**
   * Creates a draft lot for the given seller.
   *
   * @param sellerId seller primary key
   * @returns created lot instance
   */
  async createDraftLot(sellerId: number) {
    const lot = await lotRepository.create({
      title: 'Чернетка',
      initialPrice: 1,
      initialDuration: lotInitialDurations.THREE_DAYS,
      statusName: lotStatuses.DRAFT,
      sellerId,
    })

    return lot
  },

  /**
   * Updates a lot.
   *
   * @param lot lot instance
   * @param updates lot properies
   * @throws 400 when lot is not editable
   * @returns updated lot instance
   */
  async updateLot(lot: Lot, updates: Partial<Lot>) {
    const editableStatuses: string[] = [lotStatuses.DRAFT, lotStatuses.IN_TRADING_PROCESS]

    if (!editableStatuses.includes(lot.statusName)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Лот не може бути змінений у поточному статусі',
      })
    }

    lot.title = updates.title ?? lot.title
    lot.description = updates.description ?? lot.description

    if (lot.statusName === lotStatuses.DRAFT) {
      lot.initialPrice = updates.initialPrice ?? lot.initialPrice
      lot.initialDuration = updates.initialDuration ?? lot.initialDuration
    }

    if (updates.categoryId) {
      const category = await categoryService.findByIdOrFail(updates.categoryId)

      lot.category = category
      lot.categoryId = category.id
    }

    return await lotRepository.save(lot)
  },

  /**
   * Publishes a lot.
   *
   * @param lot lot instance
   * @throws 400 when lot category is not set
   * @throws 400 when lot is already published
   * @returns updated lot instance
   */
  async publishLot(lot: Lot) {
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

    lot.statusName = lotStatuses.IN_TRADING_PROCESS
    lot.effectiveDate = new Date()
    lot.expirationDate = new Date(Date.now() + lotInitialDurationsInMs[lot.initialDuration])
    lot.currentPrice = lot.initialPrice

    return await lotRepository.save(lot)
  },

  /**
   * Closes a lot.
   *
   * @param lot lot instance
   * @throws 400 when lot is not in trading process status
   * @throws 400 when lot expiration date is not reached
   * @returns updated lot instance
   */
  async closeLot(lot: Lot) {
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

    if (latestBet) {
      lot.winnerId = latestBet.userId
      lot.statusName = lotStatuses.IN_DISCUSSION_PROCESS
    }
    else {
      lot.statusName = lotStatuses.REJECTED
    }

    return await lotRepository.save(lot)
  },

  /**
   * Ships a lot.
   *
   * @param lot - lot instance
   * @throws 400 when lot is not in discussion process status
   * @returns updated lot instance
   */
  async shipLot(lot: Lot) {
    if (lot.statusName !== lotStatuses.IN_DISCUSSION_PROCESS) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Лот не може бути відправлений у поточному статусі',
      })
    }

    lot.statusName = lotStatuses.IN_DELIVERY_PROCESS

    return await lotRepository.save(lot)
  },

  /**
   * Deletes a lot.
   *
   * @throws 400 when lot is not in draft status
   * @param lot lot instance
   */
  async deleteLot(lot: Lot) {
    if (lot.statusName !== lotStatuses.DRAFT) {
      throw createError({
        message: 'Цей лот не може бути видалений, оскільки він вже опублікований',
        status: 400,
      })
    }

    await lotRepository.destroy(lot.id)
  },
}
