import type { InferAttributes, Model } from 'sequelize'

/**
 * Unwraps Sequelize model instances to their attribute types.
 *
 * @template T - The type to unwrap.
 */
export type UnwrapSequelize<T> = T extends Array<infer U>
  ? Array<UnwrapSequelize<U>>
  : T extends Model<any, any>
    ? InferAttributes<T>
    : T

/**
 * A utility function to cache database query results using Redis.
 *
 * @param key - The cache key to store/retrieve the data.
 * @param getData - A function that fetches the data if not present in cache.
 * @param getDependencies - A function that returns an array of tags (dependencies) for the cached data.
 * @param options - Additional options for the cache.
 * @param options.ttl - Time to live for the cached data in seconds (default is 24 hours).
 * @returns The cached or freshly fetched data as model instances.
 */
export async function useDatabaseCache<T>(
  key: string,
  getData: () => Promise<T>,
  getDependencies?: (data: T) => string[],
  options: { ttl?: number } = {},
): Promise<UnwrapSequelize<T>> {
  const redis = useRedis()

  try {
    const cachedData = await redis.get(key)

    if (cachedData) {
      return JSON.parse(cachedData) as UnwrapSequelize<T>
    }
  }
  catch (error) {
    await redis.del(key)
    console.warn(`Failed to retrieve cache for key ${key}:`, error)
  }

  const data = await getData()

  if (data) {
    try {
      const ttl = options.ttl ?? 86400
      const pipeline = redis.pipeline()

      pipeline.set(key, JSON.stringify(data), 'EX', ttl)

      if (getDependencies) {
        const tags = getDependencies(data)
        const expireAt = Date.now() + (ttl * 1000)

        for (const tag of tags) {
          pipeline.zadd(tag, expireAt, key)
          pipeline.zremrangebyscore(tag, '-inf', Date.now())
          pipeline.expire(tag, 604800) // 7 days
        }
      }

      await pipeline.exec()
    }
    catch {
      console.warn(`Failed to set cache for key ${key}`)
    }
  }

  return data as UnwrapSequelize<T>
}
