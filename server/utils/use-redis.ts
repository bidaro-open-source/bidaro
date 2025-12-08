import Redis from 'ioredis'

try {
  // eslint-disable-next-line ts/no-require-imports
  require('ioredis') // Fix issue with open telemetry
}
catch {}

/**
 * Singleton instance of the Redis client.
 */
let instance: Redis | undefined

/**
 * Returns a singleton Redis client instance.
 *
 * @param event H3Event
 * @returns A connected Redis client instance
 * @throws REDIS_CONNECTION_FAILED - When Redis connection cannot be established
 *
 * @example
 * // Use in API route handler
 * export default defineEventHandler(async (event) => {
 *   const redis = useRedis(event)
 *   await redis.set('key', 'value')
 *   return { success: true }
 * })
 */
export function useRedis(event?: H3Event): Redis {
  try {
    if (!instance) {
      const runtimeConfig = useRuntimeConfig(event)

      instance = new Redis({
        host: runtimeConfig.redis.host,
        port: +runtimeConfig.redis.port,
        username: runtimeConfig.redis.user,
        password: runtimeConfig.redis.pass,
      })
    }

    return instance
  }
  catch (e) {
    throw createAppError('REDIS_CONNECTION_FAILED')
  }
}
