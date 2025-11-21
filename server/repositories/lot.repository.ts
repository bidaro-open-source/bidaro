import type { LOCK, Transaction } from 'sequelize'
import type { LotAttributesOptional } from '../database'

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
   * @param id - lot primary key
   * @param data - partial lot attributes to update
   * @param options - sequelize options
   * @returns updated lot instance
   */
  async updateById(id: number, data: Partial<LotAttributesOptional>, options: Options = {}) {
    const db = useDatabase()

    const [_, [lot]] = await db.Lot.update(
      data,
      {
        where: { id },
        transaction: options.transaction,
        returning: true,
      },
    )

    return lot
  },

  /**
   * Destroys a lot record in the database.
   *
   * @param lotId - lot primary key
   * @param options - sequelize options
   */
  async destroyById(lotId: number, options: Options = {}) {
    const db = useDatabase()

    return await db.Lot.destroy({
      where: { id: lotId },
      transaction: options.transaction,
    })
  },
}
