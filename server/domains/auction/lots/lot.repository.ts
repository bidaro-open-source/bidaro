import type { WhereOptions } from 'sequelize'
import type { RepositoryOptions } from '~~/server/class/Repository'
import type { LotAttributes } from '~~/server/database'
import type { Lot } from '../../../database'
import { Repository } from '~~/server/class/Repository'

interface FindAllForCatalogOptions extends RepositoryOptions {
  where?: WhereOptions<LotAttributes>
  limit?: number
  offset?: number
}

class LotRepository extends Repository<Lot> {
  protected get model() {
    return useDatabase().Lot
  }

  /**
   * Finds all lots by seller id with lock.
   *
   * @param sellerId - seller primary key
   * @param options - sequelize options
   * @returns lots array
   */
  async findAllBySellerIdWithLock(sellerId: number, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return await db.Lot.findAll({
      where: { sellerId },
      transaction: options.transaction,
      lock: options.lock,
    })
  }

  /**
   * Finds all lots for the catalog with associations.
   *
   * @param options - query options including where, limit, offset
   * @returns lots with count and associated data
   */
  async findAllForCatalog(options: FindAllForCatalogOptions = {}) {
    const db = useDatabase()

    return await db.Lot.findAndCountAll({
      where: options.where,
      limit: options.limit,
      offset: options.offset,
      transaction: options.transaction,
      order: [['expirationDate', 'ASC']],
      include: [
        {
          model: db.LotImage,
          as: 'cover',
          where: { order: 0 },
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
          model: db.Category,
          as: 'category',
          attributes: ['id', 'displayName'],
        },
        {
          model: db.User,
          as: 'seller',
          attributes: ['name', 'surname', 'username'],
        },
        {
          model: db.User,
          as: 'winner',
          attributes: ['username'],
        },
      ],
    })
  }
}

export const lotRepository = new LotRepository()
