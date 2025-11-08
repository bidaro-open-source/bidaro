import { env } from 'node:process'
import { Redis } from 'ioredis'

export default async function setup() {
  const redis = new Redis({
    host: env.NUXT_REDIS_HOST,
    port: +(env.NUXT_REDIS_PORT || ''),
    username: env.NUXT_REDIS_USER,
    password: env.NUXT_REDIS_PASS,
  })

  const redisKeys = await redis.keys('*')

  if (redisKeys.length)
    await redis.del(redisKeys)

  return async () => {
    redis.disconnect()
  }
}
