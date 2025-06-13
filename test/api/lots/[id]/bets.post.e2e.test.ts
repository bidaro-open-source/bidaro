import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLot } from '~~/test/utils/creations/create-lot'
import { createLotPublished } from '~~/test/utils/creations/create-lot-published'
import { createLotReceived } from '~~/test/utils/creations/create-lot-received'
import { createLotRejected } from '~~/test/utils/creations/create-lot-rejected'
import { createLotShipped } from '~~/test/utils/creations/create-lot-shipped'
import { createUser } from '~~/test/utils/creations/create-user'
import { createLotBetRequest } from '~~/test/utils/requests/lots'

describe('post /api/lots/:id/bets', async () => {
  await setup()

  it('should create the bet', async () => {
    const uData1 = await createUser()
    const uData2 = await createUser({ withSession: true })
    const lotData = await createLotPublished({ ownerId: uData1.user.id })

    const response = await createLotBetRequest(
      { params: { id: lotData.lot.id }, body: { amount: 200 } },
      { accessToken: uData2.access_token },
    )

    expect(response.status).toBe(201)

    await lotData.clear()
    await uData2.clear()
    await uData1.clear()
  })

  it('should return the correct structure', async () => {
    const uData1 = await createUser()
    const uData2 = await createUser({ withSession: true })
    const lotData = await createLotPublished({ ownerId: uData1.user.id })

    const response = await createLotBetRequest(
      { params: { id: lotData.lot.id }, body: { amount: 200 } },
      { accessToken: uData2.access_token },
    )

    const bet = await response.json()

    expect(bet.id).toBeDefined()
    expect(bet.amount).toBeDefined()
    expect(bet.createdAt).toBeDefined()

    await lotData.clear()
    await uData2.clear()
    await uData1.clear()
  })

  describe('error handling', () => {
    it('should return 400 when the lot is owned by the user', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData.user.id })

      const amount = lotData.lot.initialAmount

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData.clear()
    })

    it('should return 400 when amount is equal to the latest bet', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData1.user.id })

      const amount = lotData.lot.initialAmount

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 400 when amount is less then the latest bet', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData1.user.id })

      const amount = lotData.lot.initialAmount - 0.01

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 400 when amount is less then the minimal step', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData1.user.id })

      const amount = lotData.lot.initialAmount + 0.01

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 400 when a lot is draft', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: uData1.user.id })

      const amount = lotData.lot.initialAmount * 2

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 400 when a lot is shipped', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser()
      const uData3 = await createUser({ withSession: true })
      const lotData = await createLotShipped({
        ownerId: uData1.user.id,
        winnderId: uData2.user.id,
      })

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount: lotData.winnerBet.amount * 2 } },
        { accessToken: uData3.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData3.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 400 when a lot is received', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser()
      const uData3 = await createUser({ withSession: true })
      const lotData = await createLotReceived({
        ownerId: uData1.user.id,
        winnderId: uData2.user.id,
      })

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount: lotData.winnerBet.amount * 2 } },
        { accessToken: uData3.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData3.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 400 when a lot is rejected', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser()
      const uData3 = await createUser({ withSession: true })
      const lotData = await createLotRejected({ ownerId: uData1.user.id })

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount: lotData.initialBet.amount * 2 } },
        { accessToken: uData3.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData3.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 422 when amount is less than min', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData1.user.id })

      const amount = db.LotBetFactory.minAmount - 0.01

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(422)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 422 when amount is more than max', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData1.user.id })

      const amount = db.LotBetFactory.maxAmount + 0.01

      const response = await createLotBetRequest(
        { params: { id: lotData.lot.id }, body: { amount } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(422)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 404 when the lot not found', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })

      const amount = db.LotBetFactory.amount

      const response = await createLotBetRequest(
        { params: { id: 1039849 }, body: { amount } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(404)

      await uData2.clear()
      await uData1.clear()
    })
  })
})
