import { afterAll, beforeAll } from 'vitest'
import { useRedis } from './utils/use-redis'

beforeAll(() => {
  // @ts-expect-error type
  globalThis.redis = useRedis()
})

afterAll(async () => {
  // @ts-expect-error type
  await globalThis.redis.disconnect()
  // @ts-expect-error type
  delete globalThis.redis
})

declare global {
  let redis: ReturnType<typeof useRedis>
}
