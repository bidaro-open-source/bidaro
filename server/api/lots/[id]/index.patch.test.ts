import type { UpdateLotRequest } from './index.patch.request'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { lotInitialDurations } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { createPublishedLot } from '~~/test/api-e2e/arrangers/lots/create-published-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function updateLotRequest(
  payload: UpdateLotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}`, {
    method: 'PATCH',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PATCH /api/lots/:id', async () => {
  await setup({ host: process.env.SETUP_HOST })

  it('should update lot successfully and return the correct structure', async () => {
    const uData = await createUser({ withSession: true })
    const cData = await createCategory()
    const lotData = await createLot({ sellerId: uData.user.id })

    const updatedTitle = `${lotData.lot.title} (updated)`
    const updatedDescription = `${lotData.lot.description} (updated)`
    const updatedInitialPrice = lotData.lot.initialPrice * 2
    const updatedInitialDuration = lotInitialDurations.SEVEN_DAYS

    const response = await updateLotRequest(
      {
        params: { id: lotData.lot.id },
        body: {
          title: updatedTitle,
          description: updatedDescription,
          initialPrice: updatedInitialPrice,
          initialDuration: updatedInitialDuration,
          categoryId: cData.category.id,
        },
      },
      { accessToken: uData.access_token },
    )

    const updatedLot = response._data

    expect(response.status).toBe(200)

    expect(updatedLot.id).toBeDefined()
    expect(updatedLot.title).toBe(updatedTitle)
    expect(updatedLot.description).toBe(updatedDescription)
    expect(updatedLot.initialDuration).toBe(updatedInitialDuration)
    expect(updatedLot.initialPrice).toBe(updatedInitialPrice)
    expect(updatedLot.categoryId).toBe(cData.category.id)

    await lotData.clear()
    await cData.clear()
    await uData.clear()
  })

  it('should not update lot initial values for a published lot', async () => {
    const uData = await createUser({ withSession: true })
    const cData = await createCategory()
    const lotData = await createPublishedLot({
      sellerId: uData.user.id,
      categoryId: cData.category.id,
    })

    const updatedInitialPrice = lotData.lot.initialPrice * 2
    const updatedInitialDuration = lotInitialDurations.SEVEN_DAYS

    const response = await updateLotRequest(
      {
        params: { id: lotData.lot.id },
        body: {
          initialPrice: updatedInitialPrice,
          initialDuration: updatedInitialDuration,
        },
      },
      { accessToken: uData.access_token },
    )

    const updatedLot = response._data

    expect(response.status).toBe(200)

    expect(updatedLot.initialDuration).toBe(lotData.lot.initialDuration)
    expect(updatedLot.initialPrice).toBe(lotData.lot.initialPrice)

    await lotData.clear()
    await cData.clear()
    await uData.clear()
  })

  describe('error handling', async () => {
    it('should return 401 when user is not authenticated', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ sellerId: uData.user.id })

      const response = await updateLotRequest(
        { body: { title: 'UpdatedTitle' }, params: { id: lotData.lot.id } },
      )

      expect(response.status).toBe(401)

      await lotData.clear()
      await uData.clear()
    })

    it('should return 403 when a lot is alien', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLot({ sellerId: uData1.user.id })

      const response = await updateLotRequest(
        { params: { id: lotData.lot.id }, body: {} },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(403)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 404 when a lot is not exist', async () => {
      const uData = await createUser({ withSession: true })

      const response = await updateLotRequest(
        { params: { id: 93475937459 }, body: { title: 'UpdatedTitle' } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(404)

      await uData.clear()
    })

    it('should return 422 when initial amount is less than min', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ sellerId: uData.user.id })

      const initialPrice = db.LotFactory.minAmount - 0.01

      const response = await updateLotRequest(
        { params: { id: lotData.lot.id }, body: { initialPrice } },
        { accessToken: uData.access_token },
      )

      const error = response._data

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.initialPrice).toBeDefined()

      await lotData.clear()
      await uData.clear()
    })

    it('should return 422 when initial amount is more than max', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ sellerId: uData.user.id })

      const initialPrice = db.LotFactory.maxAmount + 0.01

      const response = await updateLotRequest(
        { params: { id: lotData.lot.id }, body: { initialPrice } },
        { accessToken: uData.access_token },
      )

      const error = response._data

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.initialPrice).toBeDefined()

      await lotData.clear()
      await uData.clear()
    })

    it('should return 422 when initial duration is incorrect', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ sellerId: uData.user.id })

      const initialDuration = db.LotFactory.incorrectInitialDuration as any

      const response = await updateLotRequest(
        { params: { id: lotData.lot.id }, body: { initialDuration } },
        { accessToken: uData.access_token },
      )

      const error = response._data

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.initialDuration).toBeDefined()

      await lotData.clear()
      await uData.clear()
    })

    it('should return 400 when category not exist', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ sellerId: uData.user.id })

      const response = await updateLotRequest(
        { params: { id: lotData.lot.id }, body: { categoryId: 93475937459 } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData.clear()
    })
  })
})
