import type { Transaction } from 'sequelize'
import type { LotBet, LotBetAttributesOptional } from '../database/models/LotBet'

interface Options {
  transaction?: Transaction
}

export const lotBetRepository = {
  /**
   * Creates a new lot bet record in the database.
   *
   * @param fields - bet attributes
   * @param options - sequelize options
   * @returns LotBet instance
   */
  create(fields: LotBetAttributesOptional, options: Options = {}): Promise<LotBet> {
    const db = useDatabase()

    return db.LotBet.create(
      fields,
      {
        transaction: options.transaction,
        include: [
          {
            model: db.User,
            as: 'user',
          },
          {
            model: db.Lot,
            as: 'lot',
          },
        ],
      },
    )
  },
}
