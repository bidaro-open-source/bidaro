import { env } from 'node:process'
import { Redis } from 'ioredis'

export function useRedis() {
  try {
    return new Redis({
      host: env.NUXT_REDIS_HOST,
      port: +(env.NUXT_REDIS_PORT || ''),
      username: env.NUXT_REDIS_USER,
      password: env.NUXT_REDIS_PASS,
    })
  }
  catch (e) {
    throw new Error(`Redis is not connected. ${e}`)
  }
}
