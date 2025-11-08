import { env } from 'node:process'
import { Redis } from 'ioredis'
import { afterAll, beforeAll } from 'vitest'

beforeAll(() => {
  // @ts-expect-error type
  globalThis.redis = new Redis({
    host: env.NUXT_REDIS_HOST,
    port: +(env.NUXT_REDIS_PORT || ''),
    username: env.NUXT_REDIS_USER,
    password: env.NUXT_REDIS_PASS,
  })
})

afterAll(async () => {
  // @ts-expect-error type
  await globalThis.redis.disconnect()
  // @ts-expect-error type
  delete globalThis.redis
})

declare global {
  let redis: Redis
}
