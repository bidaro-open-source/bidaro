import type { RepositoryOptions } from '#classes/BaseRepository'
import type { LotBet } from '#database'
import { BaseRepository } from '#classes/BaseRepository'
import { Op } from 'sequelize'

class LotBetRepository extends BaseRepository<LotBet> {
  protected get model() {
    return useDatabase().LotBet
  }

  /**
   * Finds a lot by their primary key.
   *
   * @param lotId - lot primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  async findAllByLotId(lotId: number, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return await db.LotBet.findAll({
      transaction: options.transaction,
      where: { lotId },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['username'],
        },
      ],
    })
  }

  /**
   * Finds the latest lot bet by lot id.
   *
   * @param lotId - lot primary key
   * @param options - sequelize options
   * @returns lot bet or null if not found
   */
  async findLatestByLotId(lotId: number, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return await db.LotBet.findOne({
      transaction: options.transaction,
      where: { lotId },
      order: [['createdAt', 'DESC']],
    })
  }

  /**
   * Deletes lot bets by user id.
   *
   * @param userId - user primary key
   * @param options - sequelize options
   * @returns number of deleted records
   */
  async destroyByUserId(userId: number, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return await db.LotBet.destroy({
      where: { userId },
      transaction: options.transaction,
    })
  }

  /**
   * Finds unique lots where user has placed bets with pagination.
   * Includes seller, coverImage, and the last bet (highest) for each lot.
   *
   * @param userId - user primary key
   * @param limit - maximum number of results
   * @param offset - number of results to skip
   * @returns unique lots with count
   */
  async findUniqueLotsByUserId(userId: number, limit: number, offset: number) {
    const db = useDatabase()

    // First, get unique lot IDs where user has bet
    const lotBets = await db.LotBet.findAll({
      where: { userId },
      attributes: ['lotId'],
      group: ['lotId'],
      raw: true,
    })

    const lotIds = lotBets.map((bet: { lotId: number }) => bet.lotId)

    if (lotIds.length === 0) {
      return { rows: [], count: 0 }
    }

    // Now get the lots with all required associations
    return await db.Lot.findAndCountAll({
      where: { id: { [Op.in]: lotIds } },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.User,
          as: 'seller',
          attributes: ['name', 'surname', 'username'],
        },
        {
          model: db.LotImage,
          as: 'cover',
          required: false,
          include: [
            {
              model: db.Image,
              as: 'image',
              required: false,
            },
          ],
        },
        {
          model: db.LotBet,
          as: 'bets',
          required: false,
          separate: true,
          limit: 1,
          order: [['amount', 'DESC']], // Get the highest bet by amount
        },
      ],
    })
  }
}

export const lotBetRepository = new LotBetRepository()
