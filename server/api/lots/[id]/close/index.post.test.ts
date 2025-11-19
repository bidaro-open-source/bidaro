import type { GetLotRequest } from '../index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { lotStatuses } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { createPublishedLot } from '~~/test/api-e2e/arrangers/lots/create-published-lot'
import { createReadyForClosingLot } from '~~/test/api-e2e/arrangers/lots/create-ready-for-closing-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function closeLotRequest(
  payload: GetLotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/close`, {
    method: 'POST',
    accessToken: options.accessToken,
  })
}

describe('POST /api/lots/:id/close', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should close lot successfully with reject', async () => {
    const uData = await createUser({ withSession: true })
    const cData = await createCategory()
    const lotData = await createReadyForClosingLot({
      sellerId: uData.user.id,
      categoryId: cData.category.id,
    })

    const response = await closeLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    const lot = response._data

    expect(response.status).toBe(200)
    expect(lot.statusName).toBe(lotStatuses.REJECTED)
    expect(lot.winner).toBeNull()

    await lotData.clear()
    await cData.clear()
    await uData.clear()
  })

  it('should close lot successfully with winner', async () => {
    const uData = await createUser({ withSession: true })
    const uuData = await createUser({ withSession: true })
    const cData = await createCategory()
    const lotData = await createReadyForClosingLot({
      sellerId: uData.user.id,
      categoryId: cData.category.id,
      winnerId: uuData.user.id,
    })

    const response = await closeLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    const lot = response._data

    expect(response.status).toBe(200)
    expect(lot.winner?.id).toBe(uuData.user.id)
    expect(lot.statusName).toBe(lotStatuses.IN_DISCUSSION_PROCESS)

    await lotData.clear()
    await uuData.clear()
    await cData.clear()
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const uData = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createReadyForClosingLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const response = await closeLotRequest(
        { params: { id: lotData.lot.id } },
      )

      expect(response.status).toBe(401)

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })

    it('should return 403 when the lot is alien', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createReadyForClosingLot({
        sellerId: uData1.user.id,
        categoryId: cData.category.id,
      })

      const response = await closeLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(403)

      await lotData.clear()
      await cData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 404 when lot does not exist', async () => {
      const uData = await createUser({ withSession: true })

      const response = await closeLotRequest(
        { params: { id: 123456 } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(404)

      await uData.clear()
    })

    it('should return 400 when the lot is not in the process of bidding', async () => {
      const uData = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const response = await closeLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })

    it('should return 400 when time has not yet passed', async () => {
      const uData = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createPublishedLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const response = await closeLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })
  })
})
