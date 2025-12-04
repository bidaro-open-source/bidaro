import { env } from 'node:process'
import { Redis } from 'ioredis'
import { afterAll, beforeAll } from 'vitest'

beforeAll(() => {
  // @ts-expect-error type
  globalThis.redis = new Redis({
    host: env.REDIS_HOST,
    port: +(env.REDIS_PORT || ''),
    username: env.REDIS_USER,
    password: env.REDIS_PASS,
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
