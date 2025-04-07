import { useRedis } from './utils/use-redis'

export default async function setup() {
  const redis = useRedis()

  const redisKeys = await redis.keys('*')

  if (redisKeys.length)
    await redis.del(redisKeys)

  return async () => {
    redis.disconnect()
  }
}
