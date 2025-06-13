import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLotPublished } from '~~/test/utils/creations/create-lot-published'
import { createUser } from '~~/test/utils/creations/create-user'
import { getUserBetsRequest } from '~~/test/utils/requests/users'

describe('get /api/users/:id/bets', async () => {
  await setup()

  it('should return the correct structure', async () => {
    const uData1 = await createUser()
    const uData2 = await createUser()
    const lotData = await createLotPublished({ ownerId: uData1.user.id })

    const lotBetData = await db.LotBetFactory.new().create({
      lotId: lotData.lot.id,
      userId: uData2.user.id,
      amount: db.LotBetFactory.amount * 2,
    })

    const response = await getUserBetsRequest({ params: { id: uData2.user.id } })

    const bets = await response.json()

    expect(bets.length).toBe(1)

    expect(bets[0].id).toBeDefined()
    expect(bets[0].amount).toBeDefined()
    expect(bets[0].createdAt).toBeDefined()

    expect(bets[0].lot).toBeDefined()
    expect(bets[0].lot.id).toBeDefined()
    expect(bets[0].lot.title).toBeDefined()
    expect(bets[0].lot.status).toBeDefined()
    expect(bets[0].lot.initialDuration).toBeDefined()
    expect(bets[0].lot.initialAmount).toBeDefined()
    expect(bets[0].lot.effectiveDate).toBeDefined()
    expect(bets[0].lot.expirationDate).toBeDefined()

    expect(bets[0].lot.betsCount).toBe(2)
    expect(bets[0].lot.bets).toBeDefined()
    expect(bets[0].lot.bets.length).toBe(1)
    expect(bets[0].lot.bets[0].id).toBeDefined()
    expect(bets[0].lot.bets[0].amount).toBeDefined()
    expect(bets[0].lot.bets[0].user).toBeDefined()
    expect(bets[0].lot.bets[0].user.id).toBeDefined()
    expect(bets[0].lot.bets[0].user.username).toBeDefined()

    await lotBetData.destroy()
    await lotData.clear()
    await uData2.clear()
    await uData1.clear()
  })

  describe('error handling', () => {
    it('should return 404 when user is not exists', async () => {
      const response = await getUserBetsRequest({ params: { id: 123 } })

      expect(response.status).toBe(404)
    })
  })
})
