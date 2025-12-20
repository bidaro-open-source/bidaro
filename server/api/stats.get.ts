import process from 'node:process'

export default defineEventHandler(async () => {
  // Gather all metrics in parallel
  const [databaseMetrics, redisMetrics, systemMetrics] = await Promise.all([
    // Database metrics
    (async () => {
      try {
        const db = useDatabase()
        const [userCount, lotCount, lotBetCount, imageCount, categoryCount] = await Promise.all([
          db.User.count(),
          db.Lot.count(),
          db.LotBet.count(),
          db.Image.count(),
          db.Category.count(),
        ])

        return {
          users: userCount,
          lots: lotCount,
          lotBets: lotBetCount,
          images: imageCount,
          categories: categoryCount,
        }
      }
      catch (error: any) {
        logger.error('Failed to fetch database metrics', error)
        return {
          users: 0,
          lots: 0,
          lotBets: 0,
          images: 0,
          categories: 0,
          error: error.message || 'Database error',
        }
      }
    })(),

    // Redis metrics
    (async () => {
      try {
        const redis = useRedis()
        const [dbSize, memoryInfo] = await Promise.all([
          redis.dbsize(),
          redis.info('memory'),
        ])

        // Parse used_memory_human from memory info
        let usedMemoryHuman = 'N/A'
        const match = memoryInfo.match(/used_memory_human:([^\r\n]+)/)
        if (match) {
          usedMemoryHuman = match[1]
        }

        return {
          totalKeys: dbSize,
          memoryUsed: usedMemoryHuman,
        }
      }
      catch (error: any) {
        logger.error('Failed to fetch Redis metrics', error)
        return {
          totalKeys: 0,
          memoryUsed: 'error',
          error: error.message || 'Redis error',
        }
      }
    })(),

    // System metrics
    (async () => {
      try {
        const uptime = process.uptime()
        const memoryUsage = process.memoryUsage()

        return {
          processUptimeSeconds: uptime,
          memoryUsage: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
            arrayBuffers: memoryUsage.arrayBuffers,
          },
        }
      }
      catch (error: any) {
        logger.error('Failed to fetch system metrics', error)
        return {
          processUptimeSeconds: 0,
          memoryUsage: null,
          error: error.message || 'System error',
        }
      }
    })(),
  ])

  return {
    database: databaseMetrics,
    redis: redisMetrics,
    system: systemMetrics,
  }
})
