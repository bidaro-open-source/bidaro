import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLot } from '~~/test/utils/creations/create-lot'
import { createLotPublished } from '~~/test/utils/creations/create-lot-published'
import { createUser } from '~~/test/utils/creations/create-user'
import { updateLotRequest } from '~~/test/utils/requests/lots'

describe('patch /api/lots/:id', async () => {
  await setup()

  it('should update the lot and return the correct structure', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: uData.user.id })

    const updatedTitle = `${lotData.lot.title} (updated)`
    const updatedDescription = `${lotData.lot.description} (updated)`
    const updatedInitialAmount = lotData.lot.initialAmount * 2
    const updatedInitialDuration = '3_days'

    const response = await updateLotRequest(
      {
        params: { id: lotData.lot.id },
        body: {
          title: updatedTitle,
          description: updatedDescription,
          initialAmount: updatedInitialAmount,
          initialDuration: updatedInitialDuration,
        },
      },
      { accessToken: uData.access_token },
    )

    const updatedLot = await response.json()

    expect(response.status).toBe(200)

    expect(updatedLot.id).toBeDefined()
    expect(updatedLot.title).toBe(updatedTitle)
    expect(updatedLot.description).toBe(updatedDescription)
    expect(updatedLot.status).toBeDefined()
    expect(updatedLot.effectiveDate).toBeDefined()
    expect(updatedLot.expirationDate).toBeDefined()
    expect(updatedLot.initialDuration).toBe(updatedInitialDuration)
    expect(updatedLot.initialAmount).toBe(updatedInitialAmount)
    expect(updatedLot.updatedAt).toBeDefined()
    expect(updatedLot.createdAt).toBeDefined()

    await lotData.clear()
    await uData.clear()
  })

  it('should not update lot initial values for a published lot', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLotPublished({ ownerId: uData.user.id })

    const response = await updateLotRequest(
      {
        params: { id: lotData.lot.id },
        body: {
          initialAmount: lotData.lot.initialAmount + 1,
          initialDuration: '3_days',
        },
      },
      { accessToken: uData.access_token },
    )

    const updatedLot = await response.json()

    expect(response.status).toBe(200)

    expect(updatedLot.initialDuration).toBe(lotData.lot.initialDuration)
    expect(updatedLot.initialAmount).toBe(lotData.lot.initialAmount)

    await lotData.clear()
    await uData.clear()
  })

  describe('error handling', async () => {
    it('should return 404 when a lot is not exists', async () => {
      const uData = await createUser({ withSession: true })

      const response = await updateLotRequest(
        { params: { id: 93838393 }, body: {} },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(404)

      await uData.clear()
    })

    it('should return 404 when a lot is alien', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: uData1.user.id })

      const response = await updateLotRequest(
        { params: { id: lotData.lot.id }, body: {} },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(404)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 422 when initial amount is less than min', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: uData.user.id })

      const initialAmount = db.LotFactory.minAmount - 0.01

      const response = await updateLotRequest(
        { params: { id: lotData.lot.id }, body: { initialAmount } },
        { accessToken: uData.access_token },
      )

      const error = await response.json()

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.initialAmount).toBeDefined()

      await lotData.clear()
      await uData.clear()
    })

    it('should return 422 when initial amount is more than max', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: uData.user.id })

      const initialAmount = db.LotFactory.maxAmount + 0.01

      const response = await updateLotRequest(
        { params: { id: lotData.lot.id }, body: { initialAmount } },
        { accessToken: uData.access_token },
      )

      const error = await response.json()

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.initialAmount).toBeDefined()

      await lotData.clear()
      await uData.clear()
    })

    it('should return 422 when initial duration is incorrect', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: uData.user.id })

      const initialDuration = db.LotFactory.incorrectInitialDuration as any

      const response = await updateLotRequest(
        { params: { id: lotData.lot.id }, body: { initialDuration } },
        { accessToken: uData.access_token },
      )

      const error = await response.json()

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.initialDuration).toBeDefined()

      await lotData.clear()
      await uData.clear()
    })
  })
})
