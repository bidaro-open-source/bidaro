import type { Lot } from '#database'
import { EntitySource } from '#classes/EntitySource'
import { createAppError } from '#utils/create-app-error'
import { userSource } from '../../users'
import { lotBetRepository } from '../bets/lot-bet.repository'
import { lotImageRepository } from '../images/lot-image.repository'
import { lotRepository } from './lot.repository'

class LotSource extends EntitySource<Lot> {
  readonly scope = 'lots'

  get keys() {
    return {
      one: (id: number) => `${this.scope}:id:${id}`,
      oneBets: (id: number) => `${this.scope}:id:${id}:bets`,
      oneImages: (id: number) => `${this.scope}:id:${id}:images`,
      tag: (id: number) => `${this.scope}:tags:${id}`,
    }
  }

  getEntityKeys(lot: Lot): string[] {
    return [
      this.keys.one(lot.id),
      this.keys.oneBets(lot.id),
      this.keys.oneImages(lot.id),
    ]
  }

  getEntityTags(lot: Lot): string[] {
    return [
      this.keys.tag(lot.id),
    ]
  }

  /**
   * Retrieve a lot by ID, utilizing Redis caching.
   *
   * @param id - The ID of the lot to fetch.
   * @throws LOT_NOT_FOUND
   * @returns The lot instance
   */
  async getById(id: number) {
    const key = this.keys.one(id)

    return await useDatabaseCache(key, async () => {
      const data = await lotRepository.findByPk(id)

      if (!data) {
        throw createAppError('LOT_NOT_FOUND')
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

    return await useDatabaseCache(
      key,
      async () => {
        const data = await lotBetRepository.findAllByLotId(lotId)

        return data.map(bet => ({
          ...bet.toJSON(),
          user: { username: bet.user?.username || 'anonymous' },
        }))
      },
      (bets) => {
        return bets.map(bet => userSource.keys.tag(bet.userId))
      },
    )
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
