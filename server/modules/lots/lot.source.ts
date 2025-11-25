import type { Lot } from '../../database'
import type { SourceInvalidateParams } from '../../types/sources'
import { lotBetRepository } from './lot-bet.repository'
import { lotImageRepository } from './lot-image.repository'
import { lotRepository } from './lot.repository'

const SCOPE = 'lots'

const keys = {
  all: `${SCOPE}:*`,
  one: (id: number) => `${SCOPE}:id:${id}`,
  oneBets: (id: number) => `${SCOPE}:id:${id}:bets`,
  oneImages: (id: number) => `${SCOPE}:id:${id}:images`,
}

export const lotSource = {
  /**
   * Retrieve a lot by ID, utilizing Redis caching.
   *
   * @param id - The ID of the lot to fetch.
   * @throws 404 if the lot does not exist
   * @returns The lot instance
   */
  async getById(id: number) {
    const db = useDatabase()
    const key = keys.one(id)

    return await useDatabaseCache(key, db.Lot, async () => {
      const data = await lotRepository.findById(id)

      if (!data) {
        throw createError({
          message: 'Лот не знайдено',
          status: 404,
        })
      }

      return data
    })
  },

  /**
   * Retrieve all bets for a given lot, utilizing Redis caching.
   *
   * @param lotId - The ID of the lot whose bets should be fetched.
   * @returns Array of lot bets for the specified lot
   */
  async getAllBetsById(lotId: number) {
    const db = useDatabase()
    const key = keys.oneBets(lotId)

    return await useDatabaseCache(key, db.LotBet, async () => {
      return await lotBetRepository.findAllByLotId(lotId)
    })
  },

  /**
   * Retrieve all images for a given lot, utilizing Redis caching.
   *
   * @param lotId - The ID of the lot whose images should be fetched.
   * @returns Array of images for the specified lot
   */
  async getAllImagesById(lotId: number) {
    const db = useDatabase()
    const key = keys.oneImages(lotId)

    return await useDatabaseCache(key, db.Image, async () => {
      return await lotImageRepository.findAllByLotId(lotId)
    })
  },

  /**
   * Clears cache for one or more lot instances.
   *
   * @param instance - A lot instance or array of lot instances to invalidate from cache
   */
  async invalidate(instance: SourceInvalidateParams<Lot>) {
    const db = useDatabase()
    const redis = useRedis()
    const lots = Array.isArray(instance) ? instance : [instance]
    const keysForDelete = new Set<string>()

    for (const lot of lots) {
      if (!lot || !(lot instanceof db.Role))
        continue

      keysForDelete.add(keys.one(lot.id))
      keysForDelete.add(keys.oneBets(lot.id))
      keysForDelete.add(keys.oneImages(lot.id))
    }

    await redis.del([...keysForDelete])
  },

  /**
   * Invalidates all lot-related cache entries.
   */
  async invalidateAll() {
    const redis = useRedis()
    const keysForDelete = await redis.keys(keys.all)
    if (keysForDelete.length > 0) {
      await redis.del(keysForDelete)
    }
  },
}
