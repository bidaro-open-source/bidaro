import type { Lot } from '../database'
import type { SourceInvalidateParams } from '../types/sources'
import { lotBetRepository } from '../repositories/lot-bet.repository'
import { lotImageRepository } from '../repositories/lot-image.repository'
import { lotRepository } from '../repositories/lot.repository'

const SCOPE = 'lots'

const keys = {
  all: `${SCOPE}:*`,
  one: (id: number) => `${SCOPE}:id:${id}`,
  oneBets: (id: number) => `${SCOPE}:id:${id}:bets`,
  oneImages: (id: number) => `${SCOPE}:id:${id}:images`,
}

export const lotSource = {
  /**
   * Retrieves a role by ID, utilizing Redis caching.
   *
   * @throws 404 if the role does not exist
   * @returns role instance
   */
  async getById(id: number) {
    const db = useDatabase()
    const key = keys.one(id)

    return await useDatabaseCache(key, db.Lot, async () => {
      const data = await lotRepository.findById(id)

      if (!data) {
        throw createError({
          message: 'Роль не знайдена',
          status: 404,
        })
      }

      return data
    })
  },

  /**
   * Retrieves a role by ID, utilizing Redis caching.
   *
   * @throws 404 if the role does not exist
   * @returns role instance
   */
  async getAllBetsById(lotId: number) {
    const db = useDatabase()
    const key = keys.oneBets(lotId)

    return await useDatabaseCache(key, db.LotBet, async () => {
      return await lotBetRepository.findAllByLotId(lotId)
    })
  },

  /**
   * Retrieves a role by ID, utilizing Redis caching.
   *
   * @throws 404 if the role does not exist
   * @returns role instance
   */
  async getAllImagesById(lotId: number) {
    const db = useDatabase()
    const key = keys.oneImages(lotId)

    return await useDatabaseCache(key, db.Image, async () => {
      return await lotImageRepository.findAllByLotId(lotId)
    })
  },

  /**
   * Clears cache for a role.
   *
   * @param instance role instance or array of role instances
   */
  async invalidate(instance: SourceInvalidateParams<Lot>) {
    const db = useDatabase()
    const redis = useRedis()
    const roles = Array.isArray(instance) ? instance : [instance]
    const keysForDelete = new Set<string>()

    for (const role of roles) {
      if (!role || !(role instanceof db.Role))
        continue

      keysForDelete.add(keys.one(role.id))
      keysForDelete.add(keys.oneBets(role.id))
      keysForDelete.add(keys.oneImages(role.id))
    }

    await redis.del([...keysForDelete])
  },

  /**
   * Invalidates all category-related cache entries.
   */
  async invalidateAll() {
    const redis = useRedis()
    const keysForDelete = await redis.keys(keys.all)
    if (keysForDelete.length > 0) {
      await redis.del(keysForDelete)
    }
  },
}
