import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLot } from '~~/test/utils/creations/create-lot'
import { createLotPublished } from '~~/test/utils/creations/create-lot-published'
import { createUser } from '~~/test/utils/creations/create-user'
import { publishLotRequest } from '~~/test/utils/requests/lots'

describe('post /api/lots/:id/publish', async () => {
  await setup()

  it('should publish the lot', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: uData.user.id })

    const response = await publishLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    expect(response.status).toBe(200)

    await lotData.clear()
    await uData.clear()
  })

  it('should return the correct structure', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: uData.user.id })

    const response = await publishLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    const lot = await response.json()

    expect(lot.id).toBeDefined()
    expect(lot.title).toBeDefined()
    expect(lot.description).toBeDefined()
    expect(lot.status).toBeDefined()
    expect(lot.effectiveDate).toBeDefined()
    expect(lot.expirationDate).toBeDefined()
    expect(lot.initialDuration).toBeDefined()
    expect(lot.initialAmount).toBeDefined()
    expect(lot.updatedAt).toBeDefined()
    expect(lot.createdAt).toBeDefined()
    expect(lot.betsCount).toBe(1)
    expect(lot.bets).toBeDefined()
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

  describe('error handling', () => {
    it('should return 404 when the lot is not exists', async () => {
      const uData = await createUser({ withSession: true })

      const response = await publishLotRequest(
        { params: { id: 102233 } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(404)

      await uData.clear()
    })

    it('should return 404 when the lot is alien', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: uData1.user.id })

      const response = await publishLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(404)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 400 when the lot is published', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData.user.id })

      const response = await publishLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData.clear()
    })
  })
})
