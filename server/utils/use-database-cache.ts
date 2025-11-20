import type { ModelStatic } from 'sequelize'

/**
 * A utility function to cache database query results using Redis.
 *
 * @param key - The cache key to store/retrieve the data.
 * @param model  - The Sequelize model type for building instances.
 * @param fetcher - A function that fetches the data if not present in cache.
 * @returns The cached or freshly fetched data as model instances.
 */
export async function useDatabaseCache<
  Model extends ModelStatic<any>,
  ModelReturn extends InstanceType<Model> | InstanceType<Model>[],
>(
  key: string,
  model: Model,
  fetcher: () => Promise<ModelReturn>,
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
  }

  const data = await fetcher()

  if (data) {
    const newCachedData = Array.isArray(data)
      ? data.map((item: InstanceType<Model>) => item.toJSON())
      : data.toJSON()

    try {
      await redis.set(key, JSON.stringify(newCachedData))
    }
    catch {
      // ignore caching errors
    }
  }

  return data
}
