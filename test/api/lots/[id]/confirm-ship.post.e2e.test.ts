import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { lotStatuses } from '~~/server/constants'
import { createLotPublished } from '~~/test/utils/creations/create-lot-published'
import { createLotWithWinner } from '~~/test/utils/creations/create-lot-with-winner'
import { createUser } from '~~/test/utils/creations/create-user'
import { confirmShipLotRequest } from '~~/test/utils/requests/lots'

describe('post /api/lots/:id/confirm-ship', async () => {
  await setup()

  it('should confrim ship', async () => {
    const uData1 = await createUser({ withSession: true })
    const uData2 = await createUser()
    const lotData = await createLotWithWinner({
      ownerId: uData1.user.id,
      winnderId: uData2.user.id,
    })

    const response = await confirmShipLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData1.access_token },
    )

    const lot = await response.json()

    expect(response.status).toBe(200)
    expect(lot.status).toBe(lotStatuses.IN_DELIVERY_PROCESS)

    await lotData.clear()
    await uData2.clear()
    await uData1.clear()
  })

  it('should return the correct structure', async () => {
    const uData1 = await createUser({ withSession: true })
    const uData2 = await createUser()
    const lotData = await createLotWithWinner({
      ownerId: uData1.user.id,
      winnderId: uData2.user.id,
    })

    const response = await confirmShipLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData1.access_token },
    )

    const lot = await response.json()

    expect(lot.title).toBeDefined()
    expect(lot.description).toBeDefined()
    expect(lot.status).toBe(lotStatuses.IN_DELIVERY_PROCESS)
    expect(lot.effectiveDate).toBeDefined()
    expect(lot.expirationDate).toBeDefined()
    expect(lot.initialAmount).toBeDefined()
    expect(lot.initialDuration).toBeDefined()
    expect(lot.updatedAt).toBeDefined()
    expect(lot.createdAt).toBeDefined()
    expect(lot.user.id).toBeDefined()
    expect(lot.user.username).toBeDefined()
    expect(lot.winner).toBeDefined()
    expect(lot.winner.id).toBeDefined()
    expect(lot.winner.username).toBeDefined()
    expect(lot.betsCount).toBe(2)
    expect(lot.bets.length).toBe(1)
    expect(lot.bets[0].id).toBeDefined()
    expect(lot.bets[0].amount).toBeDefined()
    expect(lot.bets[0].createdAt).toBeDefined()
    expect(lot.bets[0].user).toBeDefined()
    expect(lot.bets[0].user.id).toBeDefined()
    expect(lot.bets[0].user.username).toBeDefined()

    await lotData.clear()
    await uData2.clear()
    await uData1.clear()
  })

  describe('error handling', () => {
    it('should return 404 when a lot is not exists', async () => {
      const uData = await createUser({ withSession: true })

      const response = await confirmShipLotRequest(
        { params: { id: 102393849 } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(404)

      await uData.clear()
    })

    it('should return 404 when a lot is alian', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLotWithWinner({
        ownerId: uData1.user.id,
        winnderId: uData2.user.id,
      })

      const response = await confirmShipLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(404)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 400 when a lot is trading', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData.user.id })

      const response = await confirmShipLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData.clear()
    })
  })
})
