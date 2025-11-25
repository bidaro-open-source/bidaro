import { permissionRepository } from '../repositories/permission.repository'

const SCOPE = 'permissions'

export const permissionSource = {
  /**
   * Retrieves all permission, utilizing Redis caching.
   *
   * @returns array of permission instances
   */
  async getAll() {
    const db = useDatabase()

    return await useDatabaseCache(SCOPE, db.Permission, async () => {
      return await permissionRepository.findAll()
    })
  },

  /**
   * Invalidates all permission-related cache entries.
   */
  async invalidateAll() {
    const redis = useRedis()
    await redis.del(SCOPE)
  },
}
