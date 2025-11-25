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
    })
  },

  /**
   * Finds the latest lot bet by lot id.
   *
   * @param lotId - lot primary key
   * @param options - sequelize options
   * @returns lot bet or null if not found
   */
  async findLatestByLotId(lotId: number, options: Options = {}) {
    const db = useDatabase()

    return await db.LotBet.findOne({
      transaction: options.transaction,
      where: { lotId },
      order: [['createdAt', 'DESC']],
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

  /**
   * Deletes lot bets by user id.
   *
   * @param userId - user primary key
   * @param options - sequelize options
   * @returns number of deleted records
   */
  async destroyByUserId(userId: number, options: Options = {}) {
    const db = useDatabase()

    return await db.LotBet.destroy({
      where: { userId },
      transaction: options.transaction,
    })
  },
}
