import type { InferAttributes } from 'sequelize'
import { Model } from 'sequelize'

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
 * @param fetcher - A function that fetches the data if not present in cache.
 * @param options - Additional options for the cache.
 * @param options.ttl - Time to live for the cached data in seconds (default is 24 hours).
 * @returns The cached or freshly fetched data as model instances.
 */
export async function useDatabaseCache<T>(
  key: string,
  fetcher: () => Promise<T>,
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

  const data = await fetcher()

  const plainData = normalizeSequelizeData(data)

  if (plainData) {
    try {
      await redis.set(
        key,
        JSON.stringify(plainData),
        'EX',
        options.ttl ?? 86400,
      )
    }
    catch {
      console.warn(`Failed to set cache for key ${key}`)
    }
  }

  return plainData as UnwrapSequelize<T>
}

/**
 * Normalizes Sequelize model instances to plain JavaScript objects.
 *
 * @param data - The data to normalize.
 * @returns The normalized data.
 */
function normalizeSequelizeData(data: any): any {
  if (!data)
    return data

  if (Array.isArray(data)) {
    return data.map(item => (item instanceof Model ? item.toJSON() : item))
  }

  if (data instanceof Model) {
    return data.toJSON()
  }

  return data
}
