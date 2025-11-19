import type { CreateLotBetRequest } from './index.post.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { createPublishedLot } from '~~/test/api-e2e/arrangers/lots/create-published-lot'
import { createReadyForClosingLot } from '~~/test/api-e2e/arrangers/lots/create-ready-for-closing-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function createLotBetRequest(
  payload: CreateLotBetRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/bets`, {
    method: 'POST',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('POST /api/lots/:id/bets', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should create bet successfully', async () => {
    const uData = await createUser()
    const uuData = await createUser({ withSession: true })
    const cData = await createCategory()
    const lotData = await createPublishedLot({
      sellerId: uData.user.id,
      categoryId: cData.category.id,
    })

    const amount = lotData.lot.initialPrice * 2

    const response = await createLotBetRequest(
      {
        body: { amount },
        params: { id: lotData.lot.id },
      },
      { accessToken: uuData.access_token },
    )

    await lotData.lot.reload()

    expect(response.status).toBe(200)
    expect(lotData.lot.currentPrice).toBe(amount)

    await lotData.clear()
    await cData.clear()
    await uuData.clear()
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const uData = await createUser()
      const cData = await createCategory()
      const lotData = await createPublishedLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const amount = lotData.lot.initialPrice * 2

      const response = await createLotBetRequest(
        { body: { amount }, params: { id: lotData.lot.id } },
      )

      expect(response.status).toBe(401)

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })

    it('should return 403 when user is seller', async () => {
      const uData1 = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createPublishedLot({
        sellerId: uData1.user.id,
        categoryId: cData.category.id,
      })

      const amount = lotData.lot.initialPrice * 2

      const response = await createLotBetRequest(
        { body: { amount }, params: { id: lotData.lot.id } },
        { accessToken: uData1.access_token },
      )

      expect(response.status).toBe(403)

      await lotData.clear()
      await cData.clear()
      await uData1.clear()
    })

    it('should return 404 when lot does not exist', async () => {
      const uData = await createUser({ withSession: true })

      const response = await createLotBetRequest(
        { body: { amount: 203994 }, params: { id: 123456 } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(404)

      await uData.clear()
    })

    it('should return 400 when the lot is not in the process of trading', async () => {
      const uData = await createUser()
      const uuData = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const amount = lotData.lot.initialPrice * 2

      const response = await createLotBetRequest(
        { body: { amount }, params: { id: lotData.lot.id } },
        { accessToken: uuData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await cData.clear()
      await uuData.clear()
      await uData.clear()
    })

    it('should return 400 when the lot is ready for closing', async () => {
      const uData = await createUser()
      const uuData = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createReadyForClosingLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const amount = lotData.lot.initialPrice * 2

      const response = await createLotBetRequest(
        { body: { amount }, params: { id: lotData.lot.id } },
        { accessToken: uuData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await cData.clear()
      await uuData.clear()
      await uData.clear()
    })

    it('should return 400 when the amount is less than lot price', async () => {
      const uData = await createUser()
      const uuData = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createPublishedLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const amount = lotData.lot.initialPrice * 0.5

      const response = await createLotBetRequest(
        { body: { amount }, params: { id: lotData.lot.id } },
        { accessToken: uuData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await cData.clear()
      await uuData.clear()
      await uData.clear()
    })
  })
})
