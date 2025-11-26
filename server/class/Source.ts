import type { Model } from 'sequelize'

type Instance<DataEntity extends Model> = DataEntity | null | undefined

export type SourceInvalidateParams<DataEntity extends Model> = Instance<DataEntity> | Instance<DataEntity>[]

/**
 * Abstract base class for implementing the "Source" layer (Data Fetching & Caching Strategy).
 *
 * This class provides a standardized way to manage Redis cache keys and invalidation logic
 * for Sequelize models. It abstracts the "dirty work" of generating consistent key patterns
 * and cleaning up cache entries when data changes.
 *
 * @template DataEntity - The Sequelize Model type managed by this source (e.g., `Role`, `User`).
 *
 * @example
 * ```typescript
 * class RoleSource extends Source<Role> {
 *   protected readonly scope = 'roles'
 *
 *   protected getEntityKeys(role: Role) {
 *     return {
 *        one: `${this.scope}:id:${role.id}`,
 *     }
 *   }
 *
 *   // ... implementation of fetch methods
 * }
 * ```
 */
export abstract class Source<DataEntity extends Model> {
  /**
   * Unique scope for Redis keys.
   */
  protected readonly abstract scope: string

  /**
   * Determines cache keys associated with a specific instance.
   * Used during invalidate(instance) to clean up specific entries.
   */
  protected abstract getEntityKeys(instance: DataEntity): string[]

  /**
   * Base key map.
   * Can be extended or overridden in subclasses via getter.
   */
  protected get keys() {
    return {}
  }

  /**
   * Standard invalidation logic.
   *
   * Calculates specific keys for provided instances via getEntityKeys.
   *
   * Can be overridden in the subclass if custom behavior is needed.
   *
   * @param instance - A model instance or an array of instances to invalidate
   */
  async invalidate(instance: SourceInvalidateParams<DataEntity>) {
    if (!instance)
      return

    const redis = useRedis()
    const instances = Array.isArray(instance) ? instance : [instance]
    const keysForDelete = new Set<string>()

    for (const item of instances) {
      if (!item)
        continue

      const specificKeys = this.getEntityKeys(item)

      for (const key of specificKeys) {
        keysForDelete.add(key)
      }
    }

    if (keysForDelete.size > 0) {
      await redis.del([...keysForDelete])
    }
  }

  /**
   * Complete cache flush for this module scope.
   */
  async invalidateAll() {
    const redis = useRedis()
    const keys = await redis.keys(`${this.scope}:*`)
    if (keys.length > 0) {
      await redis.del(keys)
    }
  }
}
