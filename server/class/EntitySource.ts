import type { Model } from 'sequelize'
import { BaseSource } from './BaseSource'

/**
 * A flexible type definition for invalidation arguments.
 * Allows passing a single model instance, an array of instances, or null/undefined
 * values (which are safely ignored).
 */
export type SourceInvalidateParams<T>
  = (T | null | undefined)
    | (T | null | undefined)[]
    | null
    | undefined

/**
 * Abstract class specialized for caching Sequelize Models (Entities).
 *
 * This class extends the low-level capabilities of `BaseSource` to provide
 * model-aware caching strategies. It enforces a strict contract for defining
 * how a database entity maps to cache keys and dependency tags.
 *
 * Subclasses must implement `getEntityKeys` and `getEntityTags` to define the
 * caching behavior for specific domains.
 *
 * @abstract
 * @template DataEntity - The specific Sequelize Model class.
 */
export abstract class EntitySource<DataEntity extends Model> extends BaseSource {
  /**
   * Defines the **Direct Cache Keys** associated with a specific entity instance.
   *
   * These are keys that exclusively represent the entity. When the entity is invalidated,
   * these keys are deleted directly via `DEL`.
   *
   * **Example:**
   *
   * For a User with ID 5, this might return: `['users:5:profile', 'users:5:settings']`.
   *
   * @abstract
   * @param instance - The Sequelize model instance.
   * @returns An array of Redis keys to be hard-deleted.
   */
  abstract getEntityKeys(instance: DataEntity): string[]

  /**
   * Defines the **Dependency Tags** that this entity influences.
   *
   * These are abstract labels representing collections or relations. When the entity is invalidated,
   * the system will look up all cache keys "subscribed" to these tags (via ZSet) and remove them.
   *
   * **Example:**
   *
   * When a User (ID 5) changes, they might affect: `['tag:user-seller:5', 'tag:comments:author:5']`.
   *
   * @abstract
   * @param instance - The Sequelize model instance.
   * @returns An array of tag strings.
   */
  abstract getEntityTags(instance: DataEntity): string[]

  /**
   * The main entry point for cache invalidation.
   *
   * This method orchestrates the cleanup process:
   *
   * 1. Accepts a model instance (or array/null).
   * 2. Calculates Direct Keys via `getEntityKeys`.
   * 3. Calculates Dependency Tags via `getEntityTags`.
   * 4. Resolves keys from tags using the ZSet strategy.
   * 5. Executes a batched deletion in Redis.
   *
   * It is safe to call this method with `null` or `undefined` (it will simply no-op).
   *
   * @param instance - The model instance(s) that have changed (created/updated/deleted).
   * @returns A promise that resolves when the invalidation pipeline is executed.
   */
  async invalidate(instance: SourceInvalidateParams<DataEntity>) {
    if (!instance)
      return

    const instances = Array.isArray(instance) ? instance : [instance]

    if (instances.length === 0)
      return

    const redis = useRedis()
    const directKeysToDelete = new Set<string>()
    const tagsToResolve = new Set<string>()

    for (const item of instances) {
      if (!item)
        continue

      const keys = this.getEntityKeys(item)
      for (const key of keys)
        directKeysToDelete.add(key)

      const tags = this.getEntityTags(item)
      for (const tag of tags)
        tagsToResolve.add(tag)
    }

    if (tagsToResolve.size > 0) {
      await this.invalidateTags([...tagsToResolve])
    }

    if (directKeysToDelete.size > 0) {
      await redis.del([...directKeysToDelete])
    }
  }

  /**
   * Invalidates cache keys associated with specific dependency tags.
   *
   * This method resolves the provided tags to find all dependent cache keys
   * (using `ZRANGE` on the underlying ZSet) and deletes them in a single pipeline.
   *
   * **Mechanism:**
   * 1. Reads all members from the tag's ZSet.
   * 2. Deletes the resolved cache keys.
   * 3. Deletes the tag containers themselves.
   *
   * @param tags - An array of dependency tags (e.g., `['tag:user:1', 'tag:category:5']`).
   * @returns A promise that resolves when the invalidation is complete.
   */
  protected async invalidateTags(tags: string[]) {
    if (!tags.length)
      return

    const redis = useRedis()

    const tagsList = [...new Set(tags)]
    const finalKeysToDelete = new Set<string>()

    const readPipeline = redis.pipeline()

    for (const tag of tagsList) {
      readPipeline.zrange(tag, 0, -1)
    }

    const results = await readPipeline.exec()

    for (const [err, keys] of (results || [])) {
      if (err)
        continue

      if (Array.isArray(keys)) {
        for (const k of keys) {
          finalKeysToDelete.add(k as string)
        }
      }
    }

    const writePipeline = redis.pipeline()

    writePipeline.del(tagsList)

    if (finalKeysToDelete.size > 0) {
      writePipeline.del([...finalKeysToDelete])
    }

    await writePipeline.exec()
  }
}
