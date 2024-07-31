import { Redis } from 'ioredis'

let instance: Redis | undefined

/**
 * Returns Redis instance.
 *
 * @param event H3Event
 * @returns redis instance
 * @trhows if connection is not success
 */
export default function (event?: H3Event) {
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
    throw new Error('Redis is not connected.')
  }
}
