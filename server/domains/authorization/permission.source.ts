import type { Permission } from '~~/server/database'
import { Source } from '~~/server/class/Source'
import { permissionRepository } from './permission.repository'

class PermissionSource extends Source<Permission> {
  protected scope = 'permissions'

  protected get keys() {
    return {
      ...super.keys,
      list: `${this.scope}:list`,
    }
  }

  protected getEntityKeys(): string[] {
    return []
  }

  /**
   * Retrieve all permissions, using Redis caching.
   *
   * @returns Array of permission instances
   */
  async getAll() {
    await useDatabaseCache(this.keys.list, async () => {
      return await permissionRepository.findAll()
    })
  }

  /**
   * Invalidates all permission-related cache entries.
   */
  async invalidateAll() {
    const redis = useRedis()
    await redis.del(this.keys.list)
  }
}

export const permissionSource = new PermissionSource()
