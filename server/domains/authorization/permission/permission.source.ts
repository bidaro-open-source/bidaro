import { BaseSource } from '#class/BaseSource'
import { permissionRepository } from './permission.repository'

class PermissionSource extends BaseSource {
  readonly scope = 'permissions'

  get keys() {
    return {
      list: `${this.scope}:list`,
    }
  }

  /**
   * Retrieve all permissions, using Redis caching.
   *
   * @returns Array of permission instances
   */
  async getAll() {
    return await useDatabaseCache(this.keys.list, async () => {
      return await permissionRepository.findAll()
    })
  }

  /**
   * Invalidates all permission-related cache entries.
   */
  override async invalidateAll() {
    const redis = useRedis()
    await redis.del(this.keys.list)
  }
}

export const permissionSource = new PermissionSource()
