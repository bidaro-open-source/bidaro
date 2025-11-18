import type { Transaction } from 'sequelize'
import type { LotBetAttributesOptional } from '../database/models/LotBet'

interface Options {
  transaction?: Transaction
}

export const lotBetRepository = {
  /**
   * Finds a lot by their primary key.
   *
   * @param lotId - lot primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  async findAllByLotId(lotId: number, options: Options = {}) {
    const db = useDatabase()

    return await db.LotBet.findAll({
      transaction: options.transaction,
      where: { lotId },
      include: [
        {
          model: db.User,
          as: 'user',
        },
      ],
    })
  },

  /**
   * Creates a new lot bet record in the database.
   *
   * @param fields - bet attributes
   * @param options - sequelize options
   * @returns LotBet instance
   */
  async create(fields: LotBetAttributesOptional, options: Options = {}) {
    const db = useDatabase()

    return await db.LotBet.create(
      fields,
      { transaction: options.transaction },
    )
  },
}
