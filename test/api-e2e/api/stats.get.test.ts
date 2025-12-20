import { describe, expect, it } from 'vitest'
import { fetch } from '~~/test/api-e2e/fetch'

async function statsRequest() {
  return await fetch(`/api/stats`, { method: 'GET' })
}

describe('GET /api/stats', async () => {
  it('should return stats without authentication', async () => {
    const response = await statsRequest()

    expect(response.status).toBe(200)

    const data = response._data

    // Verify response structure
    expect(data).toBeDefined()
    expect(data.database).toBeDefined()
    expect(data.redis).toBeDefined()
    expect(data.system).toBeDefined()
  })

  it('should return correct database metrics structure', async () => {
    const response = await statsRequest()
    const data = response._data

    expect(data.database.users).toBeGreaterThanOrEqual(0)
    expect(data.database.lots).toBeGreaterThanOrEqual(0)
    expect(data.database.lotBets).toBeGreaterThanOrEqual(0)
    expect(data.database.images).toBeGreaterThanOrEqual(0)
    expect(data.database.categories).toBeGreaterThanOrEqual(0)
  })

  it('should return correct redis metrics structure', async () => {
    const response = await statsRequest()
    const data = response._data

    expect(data.redis.totalKeys).toBeGreaterThanOrEqual(0)
    expect(data.redis.memoryUsed).toBeDefined()
  })

  it('should return correct system metrics structure', async () => {
    const response = await statsRequest()
    const data = response._data

    expect(data.system.processUptimeSeconds).toBeGreaterThan(0)
    expect(data.system.memoryUsage).toBeDefined()
    expect(data.system.memoryUsage.rss).toBeGreaterThan(0)
    expect(data.system.memoryUsage.heapTotal).toBeGreaterThan(0)
    expect(data.system.memoryUsage.heapUsed).toBeGreaterThan(0)
  })
})
