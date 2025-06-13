import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { lotStatuses } from '~~/server/constants'
import { createLot } from '~~/test/utils/creations/create-lot'
import { createLotPublished } from '~~/test/utils/creations/create-lot-published'
import { createUser } from '~~/test/utils/creations/create-user'
import { getLotRequest } from '~~/test/utils/requests/lots'

describe('get /api/lots/:id', async () => {
  await setup()

  it('should return the correct structure', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLotPublished({ ownerId: uData.user.id })

    const response = await getLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    const lot = await response.json()

    expect(lot.title).toBeDefined()
    expect(lot.description).toBeDefined()
    expect(lot.status).toBe(lotStatuses.IN_TRADING_PROCESS)
    expect(lot.effectiveDate).toBeDefined()
    expect(lot.expirationDate).toBeDefined()
    expect(lot.initialAmount).toBeDefined()
    expect(lot.initialDuration).toBeDefined()
    expect(lot.updatedAt).toBeDefined()
    expect(lot.createdAt).toBeDefined()
    expect(lot.user).toBeDefined()
    expect(lot.user.id).toBeDefined()
    expect(lot.user.username).toBeDefined()
    expect(lot.winner).toBeNull()
    expect(lot.betsCount).toBe(1)
    expect(lot.bets.length).toBe(1)
    expect(lot.bets[0].id).toBeDefined()
    expect(lot.bets[0].amount).toBeDefined()
    expect(lot.bets[0].createdAt).toBeDefined()
    expect(lot.bets[0].user).toBeDefined()
    expect(lot.bets[0].user.id).toBeDefined()
    expect(lot.bets[0].user.username).toBeDefined()

    await lotData.clear()
    await uData.clear()
  })

  it('should return the correct structure for a draft lot', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: uData.user.id })

    const response = await getLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    const lot = await response.json()

    expect(lot.title).toBeDefined()
    expect(lot.description).toBeDefined()
    expect(lot.status).toBe(lotStatuses.DRAFT)
    expect(lot.effectiveDate).toBeDefined()
    expect(lot.expirationDate).toBeDefined()
    expect(lot.initialAmount).toBeDefined()
    expect(lot.initialDuration).toBeDefined()
    expect(lot.updatedAt).toBeDefined()
    expect(lot.createdAt).toBeDefined()
    expect(lot.user.id).toBeDefined()
    expect(lot.user.username).toBeDefined()
    expect(lot.betsCount).toBe(0)
    expect(lot.bets.length).toBe(0)

    await lotData.clear()
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when a lot is not exists', async () => {
      const response = await getLotRequest({ params: { id: 123456 } })

      expect(response.status).toBe(404)
    })

    it('should return 404 when a lot is draft for anonymous', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: uData.user.id })

      const response = await getLotRequest({ params: { id: lotData.lot.id } })

      expect(response.status).toBe(404)

      await lotData.clear()
      await uData.clear()
    })
  })
})
