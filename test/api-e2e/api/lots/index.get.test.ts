import type { ViewLotsRequest } from '../../../../server/api/lots/index.get.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../utils/expect-error'


async function viewLotsRequest(
  payload: { query?: Partial<ViewLotsRequest['query']> } = {},
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots`, {
    method: 'GET',
    query: payload.query,
    accessToken: options.accessToken,
  })
}

describe('GET /api/lots', async () => {
  it('should retrieve lots correct structure', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_LOTS],
    })

    const lotData = await createLot({
      sellerId: data.user.id,
    })

    const response = await viewLotsRequest(
      {},
      { accessToken: data.access_token },
    )

    const meta = response._data?.meta ? response._data.meta : {}
    const lots = Array.isArray(response._data?.data) ? response._data.data : []

    expect(response.status).toBe(200)

    expect(meta).toHaveProperty('totalItems')
    expect(meta).toHaveProperty('currentPage')
    expect(meta).toHaveProperty('itemsPerPage')

    expect(lots[0]).toHaveProperty('id')
    expect(lots[0]).toHaveProperty('sellerId')
    expect(lots[0]).toHaveProperty('winnerId')
    expect(lots[0]).toHaveProperty('categoryId')
    expect(lots[0]).toHaveProperty('title')
    expect(lots[0]).toHaveProperty('description')
    expect(lots[0]).toHaveProperty('statusName')
    expect(lots[0]).toHaveProperty('initialPrice')
    expect(lots[0]).toHaveProperty('currentPrice')
    expect(lots[0]).toHaveProperty('createdAt')
    expect(lots[0]).toHaveProperty('updatedAt')

    await lotData.clear()
    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()

      const response = await viewLotsRequest()

      expectApiError(response, 'AUTHENTICATION_REQUIRED')

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await viewLotsRequest(
        {},
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await userData.clear()
    })
  })
})
