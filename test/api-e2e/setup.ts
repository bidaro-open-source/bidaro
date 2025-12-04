import { env } from 'node:process'
import { Redis } from 'ioredis'

export default async function setup() {
  const redis = new Redis({
    host: env.REDIS_HOST,
    port: +(env.REDIS_PORT || ''),
    username: env.REDIS_USER,
    password: env.REDIS_PASS,
  })

  const redisKeys = await redis.keys('*')

  if (redisKeys.length)
    await redis.del(redisKeys)

  return async () => {
    redis.disconnect()
  }
}
