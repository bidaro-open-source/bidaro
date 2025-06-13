import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/utils/creations/create-user'
import { createDraftLotRequest } from '~~/test/utils/requests/lots'

describe('post /api/lots/draft', async () => {
  await setup()

  const title = 'TestDraft'
  const description = 'TestDraft'

  it('should create a draft lot', async () => {
    const uData = await createUser({ withSession: true })

    const initialAmount = db.LotFactory.initialAmount
    const initialDuration = db.LotFactory.initialDuration

    const response = await createDraftLotRequest(
      { body: { title, description, initialAmount, initialDuration } },
      { accessToken: uData.access_token },
    )

    const lot = await response.json()

    expect(response.status).toBe(201)

    await db.Lot.destroy({ where: { id: lot.id } })
    await uData.clear()
  })

  it('should create a draft lot with max amount', async () => {
    const uData = await createUser({ withSession: true })

    const initialAmount = db.LotFactory.maxAmount
    const initialDuration = db.LotFactory.initialDuration

    const response = await createDraftLotRequest(
      { body: { title, description, initialAmount, initialDuration } },
      { accessToken: uData.access_token },
    )

    const lot = await response.json()

    expect(response.status).toBe(201)

    await db.Lot.destroy({ where: { id: lot.id } })
    await uData.clear()
  })

  it('should create a draft lot and return the correct structure', async () => {
    const uData = await createUser({ withSession: true })

    const initialAmount = db.LotFactory.initialAmount
    const initialDuration = db.LotFactory.initialDuration

    const response = await createDraftLotRequest(
      { body: { title, description, initialAmount, initialDuration } },
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
    expect(lot.user).toBeDefined()
    expect(lot.user.id).toBeDefined()
    expect(lot.user.username).toBeDefined()
    expect(lot.winner).toBeNull()
    expect(lot.betsCount).toBe(0)
    expect(lot.bets).toBeDefined()
    expect(lot.bets.length).toBe(0)

    await db.Lot.destroy({ where: { id: lot.id } })
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 422 when title is undefined', async () => {
      const uData = await createUser({ withSession: true })

      const initialAmount = db.LotFactory.initialAmount
      const initialDuration = db.LotFactory.initialDuration

      const response = await createDraftLotRequest(
        { body: { title: undefined as any, description, initialAmount, initialDuration } },
        { accessToken: uData.access_token },
      )

      const error = await response.json()

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.title).toBeDefined()

      await uData.clear()
    })

    it('should return 422 when initial amount is less than min', async () => {
      const uData = await createUser({ withSession: true })

      const initialAmount = db.LotFactory.minAmount - 0.01
      const initialDuration = db.LotFactory.initialDuration

      const response = await createDraftLotRequest(
        { body: { title, description, initialAmount, initialDuration } },
        { accessToken: uData.access_token },
      )

      const error = await response.json()

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.initialAmount).toBeDefined()

      await uData.clear()
    })

    it('should return 422 when initial amount is more than max', async () => {
      const uData = await createUser({ withSession: true })

      const initialAmount = db.LotFactory.maxAmount + 0.01
      const initialDuration = db.LotFactory.initialDuration

      const response = await createDraftLotRequest(
        { body: { title, description, initialAmount, initialDuration } },
        { accessToken: uData.access_token },
      )

      const error = await response.json()

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.initialAmount).toBeDefined()

      await uData.clear()
    })

    it('should return 422 when initial duration is incorrect', async () => {
      const uData = await createUser({ withSession: true })

      const initialAmount = db.LotFactory.initialAmount
      const initialDuration = db.LotFactory.incorrectInitialDuration as any

      const response = await createDraftLotRequest(
        { body: { title, description, initialAmount, initialDuration } },
        { accessToken: uData.access_token },
      )

      const error = await response.json()

      expect(response.status).toBe(422)
      expect(error.data.fieldErrors.initialDuration).toBeDefined()

      await uData.clear()
    })
  })
})
