import type RedisClass from 'ioredis'

// eslint-disable-next-line ts/no-require-imports
const Redis: typeof RedisClass = require('ioredis') // Use require to avoid OpenTelemetry issues

/**
 * Singleton instance of the Redis client.
 */
let instance: RedisClass | undefined

/**
 * Returns a singleton Redis client instance.
 *
 * @param event H3Event
 * @returns A connected Redis client instance
 * @throws Error if Redis connection cannot be established
 *
 * @example
 * // Use in API route handler
 * export default defineEventHandler(async (event) => {
 *   const redis = useRedis(event)
 *   await redis.set('key', 'value')
 *   return { success: true }
 * })
 */
export function useRedis(event?: H3Event): RedisClass {
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
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Redis connection failed',
      data: e,
    })
  }
}
