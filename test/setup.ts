import { useDatabase } from './utils/use-database'
import { useRedis } from './utils/use-redis'

export default async function setup() {
  const db = useDatabase()
  const redis = useRedis()

  await db.sequelize.sync({ force: true })

  const redisKeys = await redis.keys('*')

  if (redisKeys.length)
    await redis.del(redisKeys)

  return async () => {
    redis.disconnect()
    await db.sequelize.close()
  }
}
