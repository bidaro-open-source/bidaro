import type { RepositoryOptions } from '~~/server/class/Repository'
import type { LotBet } from '../../../database/models/LotBet'
import { Repository } from '~~/server/class/Repository'

class LotBetRepository extends Repository<LotBet> {
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
}

export const lotBetRepository = new LotBetRepository()
