import type { LOCK, Transaction } from 'sequelize'
import type { Lot, LotAttributesOptional } from '../database'

interface Options {
  lock?: LOCK
  transaction?: Transaction
}

export const lotRepository = {
  /**
   * Finds a lot by their primary key.
   *
   * @param id - lot primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  async findById(id: number, options: Options = {}) {
    const db = useDatabase()

    return await db.Lot.findByPk(id, {
      transaction: options.transaction,
      include: [
        {
          model: db.Image,
          as: 'images',
          through: { attributes: [] },
          order: [
            [db.LotImage, 'order', 'ASC'],
          ],
        },
        {
          model: db.User,
          as: 'seller',
        },
        {
          model: db.User,
          as: 'winner',
        },
        {
          model: db.Category,
          as: 'category',
        },
        {
          model: db.LotBet,
          as: 'bets',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: db.User,
              as: 'user',
            },
          ],
        },
      ],
    })
  },

  /**
   * Finds a lot by their primary key with lock.
   *
   * @param id - lot primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  async findByIdWithLock(id: number, options: Required<Options>) {
    const db = useDatabase()

    return await db.Lot.findByPk(id, {
      transaction: options.transaction,
      lock: options.lock,
    })
  },

  /**
   * Creates a new lot record in the database.
   *
   * Included models:
   * - User (all fields)
   *
   * @param fields - lot attributes
   * @param options - sequelize options
   * @returns lot instance
   */
  async create(fields: LotAttributesOptional, options: Options = {}) {
    const db = useDatabase()

    return await db.Lot.create(
      fields,
      { transaction: options.transaction },
    )
  },

  /**
   * Save a chagned lot record in the database.
   *
   * @param lot - lot instance
   * @param options - sequelize options
   * @returns lot instance
   */
  async save(lot: Lot, options: Options = {}) {
    return await lot.save({ transaction: options.transaction })
  },

  /**
   * Destorys a lot record in the database.
   *
   * @param lotId - lot primary key
   * @param options - sequelize options
   */
  async destroy(lotId: number, options: Options = {}) {
    const db = useDatabase()

    return await db.Lot.destroy({
      where: { id: lotId },
      transaction: options.transaction,
    })
  },
}
