import type { User } from '../database'
import type { SourceInvalidateParams } from '../types/sources'
import { userRepository } from '../repositories/user.repository'

const SCOPE = 'users'

const keys = {
  all: `${SCOPE}:*`,
  one: (id: number) => `${SCOPE}:id:${id}`,
}

export const userSource = {
  /**
   * Retrieves a user by ID, utilizing Redis caching.
   *
   * @throws 404 if the user does not exist
   * @returns user instance
   */
  async getById(id: number) {
    const db = useDatabase()
    const key = keys.one(id)

    return await useDatabaseCache(key, db.User, async () => {
      const data = await userRepository.findById(id)

      if (!data) {
        throw createError({
          message: 'Користувача не знайдено',
          status: 404,
        })
      }

      return data
    })
  },

  /**
   * Clears cache for a user.
   *
   * @param instance user instance or array of user instances
   */
  async invalidate(instance: SourceInvalidateParams<User>) {
    const db = useDatabase()
    const redis = useRedis()
    const users = Array.isArray(instance) ? instance : [instance]
    const keysForDelete = new Set<string>()

    for (const user of users) {
      if (!user || !(user instanceof db.User))
        continue

      keysForDelete.add(keys.one(user.id))
    }

    await redis.del([...keysForDelete])
  },

  /**
   * Invalidates all user-related cache entries.
   */
  async invalidateAll() {
    const redis = useRedis()
    const keysForDelete = await redis.keys(keys.all)
    if (keysForDelete.length > 0) {
      await redis.del(keysForDelete)
    }
  },
}
