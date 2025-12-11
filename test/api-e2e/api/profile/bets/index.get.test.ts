import type { ViewProfileBetsRequest } from '../../../../../server/api/profile/bets/index.get.request'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createPublishedLot } from '~~/test/api-e2e/arrangers/lots/create-published-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../utils/expect-api-error'

async function viewProfileBetsRequest(
  payload: { query?: Partial<ViewProfileBetsRequest['query']> } = {},
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/profile/bets`, {
    method: 'GET',
    query: payload.query,
    accessToken: options.accessToken,
  })
}

describe('GET /api/profile/bets', async () => {
  it('should retrieve lots where user has placed bets with correct structure', async () => {
    const sellerData = await createUser()
    const bidderData = await createUser({
      withRole: true,
      withSession: true,
    })
    const categoryData = await createCategory()

    const lotData = await createPublishedLot({
      sellerId: sellerData.user.id,
      categoryId: categoryData.category.id,
    })

    // Create a bet for the user
    const bet = await db.LotBetFactory.new().create({
      lotId: lotData.lot.id,
      userId: bidderData.user.id,
      amount: lotData.lot.initialPrice + 100,
    })

    const response = await viewProfileBetsRequest(
      {},
      { accessToken: bidderData.access_token },
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
    expect(lots[0]).toHaveProperty('seller')
    expect(lots[0]).toHaveProperty('cover')
    expect(lots[0]).toHaveProperty('lastBet')
    expect(lots[0].id).toBe(lotData.lot.id)
    expect(lots[0].seller).toHaveProperty('username')
    expect(lots[0].lastBet).toHaveProperty('id')
    expect(lots[0].lastBet).toHaveProperty('amount')
    expect(lots[0].lastBet.amount).toBe(bet.amount)

    await bet.destroy()
    await lotData.clear()
    await categoryData.clear()
    await bidderData.clear()
    await sellerData.clear()
  })

  it('should return empty array when user has no bets', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
    })

    const response = await viewProfileBetsRequest(
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

  it('should return unique lots even with multiple bets', async () => {
    const sellerData = await createUser()
    const bidderData = await createUser({
      withRole: true,
      withSession: true,
    })
    const categoryData = await createCategory()

    const lotData = await createPublishedLot({
      sellerId: sellerData.user.id,
      categoryId: categoryData.category.id,
    })

    // Create multiple bets for the same lot
    const bet1 = await db.LotBetFactory.new().create({
      lotId: lotData.lot.id,
      userId: bidderData.user.id,
      amount: lotData.lot.initialPrice + 100,
    })

    const bet2 = await db.LotBetFactory.new().create({
      lotId: lotData.lot.id,
      userId: bidderData.user.id,
      amount: lotData.lot.initialPrice + 200,
    })

    const response = await viewProfileBetsRequest(
      {},
      { accessToken: bidderData.access_token },
    )

    const lots = Array.isArray(response._data?.data) ? response._data.data : []

    expect(response.status).toBe(200)
    expect(lots).toHaveLength(1)
    expect(response._data.meta.totalItems).toBe(1)
    // Should return the latest bet
    expect(lots[0].lastBet.amount).toBe(bet2.amount)

    await bet1.destroy()
    await bet2.destroy()
    await lotData.clear()
    await categoryData.clear()
    await bidderData.clear()
    await sellerData.clear()
  })

  it('should paginate lots correctly', async () => {
    const sellerData = await createUser()
    const bidderData = await createUser({
      withRole: true,
      withSession: true,
    })
    const categoryData = await createCategory()

    // Create 3 lots with bets
    const lot1 = await createPublishedLot({
      sellerId: sellerData.user.id,
      categoryId: categoryData.category.id,
    })
    const bet1 = await db.LotBetFactory.new().create({
      lotId: lot1.lot.id,
      userId: bidderData.user.id,
      amount: lot1.lot.initialPrice + 100,
    })

    const lot2 = await createPublishedLot({
      sellerId: sellerData.user.id,
      categoryId: categoryData.category.id,
    })
    const bet2 = await db.LotBetFactory.new().create({
      lotId: lot2.lot.id,
      userId: bidderData.user.id,
      amount: lot2.lot.initialPrice + 100,
    })

    const lot3 = await createPublishedLot({
      sellerId: sellerData.user.id,
      categoryId: categoryData.category.id,
    })
    const bet3 = await db.LotBetFactory.new().create({
      lotId: lot3.lot.id,
      userId: bidderData.user.id,
      amount: lot3.lot.initialPrice + 100,
    })

    // Get first page with limit 2
    const response1 = await viewProfileBetsRequest(
      { query: { page: 1, limit: 2 } },
      { accessToken: bidderData.access_token },
    )

    const lots1 = Array.isArray(response1._data?.data) ? response1._data.data : []
    expect(response1.status).toBe(200)
    expect(lots1).toHaveLength(2)
    expect(response1._data.meta.totalItems).toBe(3)

    // Get second page
    const response2 = await viewProfileBetsRequest(
      { query: { page: 2, limit: 2 } },
      { accessToken: bidderData.access_token },
    )

    const lots2 = Array.isArray(response2._data?.data) ? response2._data.data : []
    expect(response2.status).toBe(200)
    expect(lots2).toHaveLength(1)

    await bet1.destroy()
    await bet2.destroy()
    await bet3.destroy()
    await lot1.clear()
    await lot2.clear()
    await lot3.clear()
    await categoryData.clear()
    await bidderData.clear()
    await sellerData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await viewProfileBetsRequest()

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })
  })
})
