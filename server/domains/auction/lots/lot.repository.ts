import type { RepositoryOptions } from '~~/server/class/Repository'
import type { Lot } from '../../../database'
import { Repository } from '~~/server/class/Repository'

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
}

export const lotRepository = new LotRepository()
