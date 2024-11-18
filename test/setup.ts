import { syncDatabase } from './utils/sync/sync-database'
import { syncPermissions } from './utils/sync/sync-permissions'
import { useDatabase } from './utils/use-database'
import { useRedis } from './utils/use-redis'

export default async function setup() {
  const db = useDatabase()
  const redis = useRedis()

  await syncDatabase(db)
  await syncPermissions(db)

  const redisKeys = await redis.keys('*')

  if (redisKeys.length)
    await redis.del(redisKeys)

  return async () => {
    redis.disconnect()
    await db.sequelize.close()
  }
}
