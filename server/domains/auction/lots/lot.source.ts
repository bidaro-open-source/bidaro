import type { Lot } from '../../../database'
import { Source } from '~~/server/class/Source'
import { lotBetRepository } from '../bets/lot-bet.repository'
import { lotImageRepository } from '../images/lot-image.repository'
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
    const key = this.keys.one(id)

    return await useDatabaseCache(key, async () => {
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
    const key = this.keys.oneBets(lotId)

    return await useDatabaseCache(key, async () => {
      const data = await lotBetRepository.findAllByLotId(lotId)

      return data.map(bet => ({
        ...bet.toJSON(),
        user: { username: bet.user?.username || 'anonymous' },
      }))
    })
  }

  /**
   * Retrieve all images for a given lot, utilizing Redis caching.
   *
   * @param lotId - The ID of the lot whose images should be fetched.
   * @returns Array of images for the specified lot
   */
  async getAllImagesById(lotId: number) {
    const key = this.keys.oneImages(lotId)

    return await useDatabaseCache(key, async () => {
      return await lotImageRepository.findAllByLotId(lotId)
    })
  }
}

export const lotSource = new LotSource()
