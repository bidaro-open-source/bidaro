import type { ViewProfileLotsRequest } from '../../../../../server/api/profile/lots/index.get.request'
import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../utils/expect-api-error'

async function viewProfileLotsRequest(
  payload: { query?: Partial<ViewProfileLotsRequest['query']> } = {},
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/profile/lots`, {
    method: 'GET',
    query: payload.query,
    accessToken: options.accessToken,
  })
}

describe('GET /api/profile/lots', async () => {
  it('should retrieve user\'s lots with correct structure', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
    })

    const lotData = await createLot({
      sellerId: userData.user.id,
    })

    const response = await viewProfileLotsRequest(
      {},
      { accessToken: userData.access_token },
    )

    const meta = response._data?.meta ? response._data.meta : {}
    const lots = Array.isArray(response._data?.data) ? response._data.data : []

    expect(response.status).toBe(200)

    expect(meta).toHaveProperty('totalItems')
    expect(meta).toHaveProperty('currentPage')
    expect(meta).toHaveProperty('itemsPerPage')
    expect(meta.totalItems).toBe(1)

    expect(lots).toHaveLength(1)
    expect(lots[0]).toHaveProperty('id')
    expect(lots[0]).toHaveProperty('title')
    expect(lots[0]).toHaveProperty('statusName')
    expect(lots[0]).toHaveProperty('initialPrice')
    expect(lots[0]).toHaveProperty('currentPrice')
    expect(lots[0]).toHaveProperty('cover')
    expect(lots[0].id).toBe(lotData.lot.id)

    await lotData.clear()
    await userData.clear()
  })

  it('should return empty array when user has no lots', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
    })

    const response = await viewProfileLotsRequest(
      {},
      { accessToken: userData.access_token },
    )

    const meta = response._data?.meta ? response._data.meta : {}
    const lots = Array.isArray(response._data?.data) ? response._data.data : []

    expect(response.status).toBe(200)
    expect(lots).toHaveLength(0)
    expect(meta.totalItems).toBe(0)

    await userData.clear()
  })

  it('should paginate lots correctly', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
    })

    // Create 3 lots
    const lot1 = await createLot({ sellerId: userData.user.id })
    const lot2 = await createLot({ sellerId: userData.user.id })
    const lot3 = await createLot({ sellerId: userData.user.id })

    // Get first page with limit 2
    const response1 = await viewProfileLotsRequest(
      { query: { page: 1, limit: 2 } },
      { accessToken: userData.access_token },
    )

    const lots1 = Array.isArray(response1._data?.data) ? response1._data.data : []
    expect(response1.status).toBe(200)
    expect(lots1).toHaveLength(2)
    expect(response1._data.meta.totalItems).toBe(3)

    // Get second page
    const response2 = await viewProfileLotsRequest(
      { query: { page: 2, limit: 2 } },
      { accessToken: userData.access_token },
    )

    const lots2 = Array.isArray(response2._data?.data) ? response2._data.data : []
    expect(response2.status).toBe(200)
    expect(lots2).toHaveLength(1)

    await lot1.clear()
    await lot2.clear()
    await lot3.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await viewProfileLotsRequest()

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })
  })
})
