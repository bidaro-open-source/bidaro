/**
 * Abstract base class serving as the Data Access Layer (DAL) with advanced caching capabilities.
 *
 * This class provides a unified interface for managing Redis cache invalidation
 * using a **Self-Cleaning Tag Strategy**.
 *
 * **Key Architectural Features:**
 * - **Tag-Based Invalidation:** Uses Redis `ZSet` (Sorted Sets) to map tags to cache keys.
 * - **Self-Cleaning:** Keys within tags are scored by their expiration timestamp, allowing
 * automatic cleanup of "zombie" dependencies during write operations.
 * - **Non-Blocking Operations:** Uses `SCAN` for bulk deletions to avoid blocking the Redis event loop.
 *
 * @abstract
 */
export abstract class BaseSource {
  /**
   * The unique namespace for this data source.
   *
   * This value is used as a prefix for cache keys to ensure isolation between
   * different domains (e.g., `'users'`, `'catalog'`, `'system'`).
   *
   * @readonly
   */
  abstract readonly scope: string

  /**
   * Performs a safe, non-blocking mass deletion of all keys within the current scope.
   *
   * Unlike the `KEYS` command, this method uses `SCAN` with a cursor to iterate
   * through the database in small batches. This ensures the Redis server remains
   * responsive even when deleting millions of keys.
   *
   * **Pattern:** `${this.scope}:*`
   *
   * @returns A promise that resolves when all scoped keys are deleted.
   */
  async invalidateAll(): Promise<void> {
    const redis = useRedis()
    const match = `${this.scope}:*`
    let cursor = '0'

    do {
      const [newCursor, foundKeys] = await redis.scan(cursor, 'MATCH', match, 'COUNT', 100)
      cursor = newCursor

      if (foundKeys.length > 0) {
        await redis.del(foundKeys)
      }
    } while (cursor !== '0')
  }
}
