import type { RepositoryOptions } from '#classes/BaseRepository'
import type { Lot } from '#database'
import { BaseRepository } from '#classes/BaseRepository'

class LotRepository extends BaseRepository<Lot> {
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
   * Finds all lots by seller id with pagination and coverImage.
   *
   * @param sellerId - seller primary key
   * @param limit - maximum number of results
   * @param offset - number of results to skip
   * @returns lots array with count
   */
  async findAllBySellerIdWithCover(sellerId: number, limit: number, offset: number) {
    const db = useDatabase()

    return await db.Lot.findAndCountAll({
      where: { sellerId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
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
      ],
    })
  }

  /**
   * Destroys all lots by seller id.
   *
   * @param sellerId - seller primary key
   * @param options - sequelize options
   * @returns number of deleted records
   */
  async destroyBySellerId(sellerId: number, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return await db.Lot.destroy({
      where: { sellerId },
      transaction: options.transaction,
    })
  }
}

export const lotRepository = new LotRepository()
