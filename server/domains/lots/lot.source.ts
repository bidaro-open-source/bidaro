import type { Lot } from '../../database'
import { Source } from '~~/server/class/Source'
import { lotBetRepository } from './lot-bet.repository'
import { lotImageRepository } from './lot-image.repository'
import { lotRepository } from './lot.repository'

class LotSource extends Source<Lot> {
  protected scope = 'lots'

  protected get keys() {
    return {
      ...super.keys,
      one: (id: number) => `${this.scope}:id:${id}`,
      oneBets: (id: number) => `${this.scope}:id:${id}:bets`,
      oneImages: (id: number) => `${this.scope}:id:${id}:images`,
    }
  }

  protected getEntityKeys(lot: Lot): string[] {
    return [
      this.keys.one(lot.id),
      this.keys.oneBets(lot.id),
      this.keys.oneImages(lot.id),
    ]
  }

  /**
   * Retrieve a lot by ID, utilizing Redis caching.
   *
   * @param id - The ID of the lot to fetch.
   * @throws 404 if the lot does not exist
   * @returns The lot instance
   */
  async getById(id: number) {
    const db = useDatabase()
    const key = this.keys.one(id)

    return await useDatabaseCache(key, db.Lot, async () => {
      const data = await lotRepository.findByPk(id)

      if (!data) {
        throw createError({
          message: 'Лот не знайдено',
          status: 404,
        })
      }

      return data
    })
  }

  /**
   * Retrieve all bets for a given lot, utilizing Redis caching.
   *
   * @param lotId - The ID of the lot whose bets should be fetched.
   * @returns Array of lot bets for the specified lot
   */
  async getAllBetsById(lotId: number) {
    const db = useDatabase()
    const key = this.keys.oneBets(lotId)

    return await useDatabaseCache(key, db.LotBet, async () => {
      return await lotBetRepository.findAllByLotId(lotId)
    })
  }

  /**
   * Retrieve all images for a given lot, utilizing Redis caching.
   *
   * @param lotId - The ID of the lot whose images should be fetched.
   * @returns Array of images for the specified lot
   */
  async getAllImagesById(lotId: number) {
    const db = useDatabase()
    const key = this.keys.oneImages(lotId)

    return await useDatabaseCache(key, db.Image, async () => {
      return await lotImageRepository.findAllByLotId(lotId)
    })
  }
}

export const lotSource = new LotSource()
