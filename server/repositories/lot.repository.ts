import type { Transaction } from 'sequelize'
import type { Lot, LotAttributesOptional } from '../database'
import type { LotBet } from '../database/models/LotBet'

interface Options {
  transaction?: Transaction
}

export const lotRepository = {
  /**
   * Finds a lot by their primary key.
   *
   * Included models:
   * - User (all fields)
   * - LotBet (all fields) (with limit 1)
   *   - User (all fields)
   *
   * @param id - lot primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  findById: (id: number, options: Options = {}): Promise<Lot | null> => {
    const db = useDatabase()

    return db.Lot.findByPk(id, {
      transaction: options.transaction,
      include: [
        {
          model: db.User,
          as: 'user',
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
   * Finds a lot by their primary key.
   *
   * Included models:
   * - User (all fields)
   * - LotBet (all fields) (with limit 1)
   *   - User (all fields)
   *
   * @param id - lot primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  findAllBetsById: (id: number, options: Options = {}): Promise<LotBet[]> => {
    const db = useDatabase()

    return db.LotBet.findAll({
      transaction: options.transaction,
      where: { lotId: id },
      include: [
        {
          model: db.User,
          as: 'user',
        },
      ],
    })
  },

  /**
   * Returns the count of lot bets by lot id.
   *
   * @param ids - lots primary key
   * @param options - sequelize options
   * @returns count of lot bets
   */
  countAllBetsByIds: async (ids: number[], options: Options = {}): Promise<{ [key: number]: number }> => {
    const db = useDatabase()
    const lotsBets: { [key: number]: number } = {}

    const bets = await db.LotBet.findAll({
      transaction: options.transaction,
      where: { lotId: ids },
      attributes: ['lotId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
      group: ['lotId'],
      raw: true,
    })

    for (const bet of bets) {
      lotsBets[bet.lotId] = Number((bet as any)?.count)
    }

    return lotsBets
  },

  /**
   * Returns the count of lot bets by lot id.
   *
   * @param id - lot primary key
   * @param options - sequelize options
   * @returns count of lot bets
   */
  countAllBetsById: (id: number, options: Options = {}): Promise<number> => {
    const db = useDatabase()

    return db.LotBet.count({
      transaction: options.transaction,
      where: { lotId: id },
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
  create(fields: LotAttributesOptional, options: Options = {}): Promise<Lot> {
    const db = useDatabase()

    return db.Lot.create(
      fields,
      {
        transaction: options.transaction,
        include: [
          {
            model: db.User,
            as: 'user',
          },
          {
            model: db.LotBet,
            as: 'bets',
            include: [
              {
                model: db.User,
                as: 'user',
              },
            ],
          },
        ],
      },
    )
  },

  /**
   * Save a chagned lot record in the database.
   *
   * @param lot - lot instance
   * @param options - sequelize options
   * @returns lot instance
   */
  save(lot: Lot, options: Options = {}): Promise<Lot> {
    return lot.save({ transaction: options.transaction })
  },

  /**
   * Destorys a lot record in the database.
   *
   * @param lot - lot instance
   * @param options - sequelize options
   */
  destroy(lot: Lot, options: Options = {}): Promise<void> {
    return lot.destroy({ transaction: options.transaction })
  },
}
