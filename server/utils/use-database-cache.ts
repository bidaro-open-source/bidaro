import type { ModelStatic } from 'sequelize'

/**
 * A utility function to cache database query results using Redis.
 *
 * @param key - The cache key to store/retrieve the data.
 * @param model  - The Sequelize model type for building instances.
 * @param fetcher - A function that fetches the data if not present in cache.
 * @param options - Additional options for the cache.
 * @param options.ttl - Time to live for the cached data in seconds (default is 24 hours).
 * @returns The cached or freshly fetched data as model instances.
 */
export async function useDatabaseCache<
  Model extends ModelStatic<any>,
  ModelReturn extends InstanceType<Model> | InstanceType<Model>[],
>(
  key: string,
  model: Model,
  fetcher: () => Promise<ModelReturn>,
  options: { ttl?: number } = {},
): Promise<ModelReturn> {
  const redis = useRedis()

  try {
    const cachedData = await redis.get(key)

    if (cachedData) {
      const parsed = JSON.parse(cachedData)

      return Array.isArray(parsed)
        ? model.bulkBuild(parsed, { isNewRecord: false }) as ModelReturn
        : model.build(parsed, { isNewRecord: false })
    }
  }
  catch (error) {
    await redis.del(key)
    // TODO: add logger
  }

  const data = await fetcher()

  if (data) {
    const newCachedData = Array.isArray(data)
      ? data.map((item: InstanceType<Model>) => item.toJSON())
      : data.toJSON()

    try {
      await redis.set(key, JSON.stringify(newCachedData), 'EX', options.ttl ?? 60 * 60 * 24)
    }
    catch {
      // TODO: add logger
    }
  }

  return data
}
