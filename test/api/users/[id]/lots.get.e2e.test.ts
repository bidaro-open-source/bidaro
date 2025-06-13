import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLot } from '~~/test/utils/creations/create-lot'
import { createLotPublished } from '~~/test/utils/creations/create-lot-published'
import { createUser } from '~~/test/utils/creations/create-user'
import { getUserLotsRequest } from '~~/test/utils/requests/users'

describe('get /api/users/:id/lots', async () => {
  await setup()

  it('should return the correct structure', async () => {
    const uData = await createUser()
    const lotData = await createLotPublished({ ownerId: uData.user.id })

    const response = await getUserLotsRequest({ params: { id: uData.user.id } })

    const lots = await response.json()

    expect(lots.length).toBe(1)
    expect(lots[0].id).toBeDefined()
    expect(lots[0].title).toBeDefined()
    expect(lots[0].status).toBeDefined()
    expect(lots[0].initialDuration).toBeDefined()
    expect(lots[0].initialAmount).toBeDefined()
    expect(lots[0].effectiveDate).toBeDefined()
    expect(lots[0].expirationDate).toBeDefined()
    expect(lots[0].winner).toBeNull()
    expect(lots[0].betsCount).toBe(1)
    expect(lots[0].bets).toBeDefined()
    expect(lots[0].bets.length).toBe(1)
    expect(lots[0].bets[0].id).toBeDefined()
    expect(lots[0].bets[0].amount).toBeDefined()
    expect(lots[0].bets[0].user).toBeDefined()
    expect(lots[0].bets[0].user.id).toBeDefined()
    expect(lots[0].bets[0].user.username).toBeDefined()

    await lotData.clear()
    await uData.clear()
  })

  it('should return the collection of lots for authenticated user', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: uData.user.id })
    const publishedLotData = await createLotPublished({ ownerId: uData.user.id })

    const response = await getUserLotsRequest(
      { params: { id: uData.user.id } },
      { accessToken: uData.access_token },
    )

    const lots = await response.json()

    expect(lots.length).toBe(2)

    await publishedLotData.clear()
    await lotData.clear()
    await uData.clear()
  })

  it('should return the collection of lots for anonymous user', async () => {
    const uData = await createUser()
    const lotData = await createLot({ ownerId: uData.user.id })
    const publishedLotData = await createLotPublished({ ownerId: uData.user.id })

    const response = await getUserLotsRequest({ params: { id: uData.user.id } })

    const lots = await response.json()

    expect(lots.length).toBe(1)

    await publishedLotData.clear()
    await lotData.clear()
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when user is not exists', async () => {
      const response = await getUserLotsRequest({ params: { id: 123 } })

      expect(response.status).toBe(404)
    })
  })
})
