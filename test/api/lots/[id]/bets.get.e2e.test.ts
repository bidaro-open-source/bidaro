import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLotPublished } from '~~/test/utils/creations/create-lot-published'
import { createUser } from '~~/test/utils/creations/create-user'
import { getLotBetsRequest } from '~~/test/utils/requests/lots'

describe('get /api/lots/:id/bets', async () => {
  await setup()

  it('should return the correct structure', async () => {
    const uData = await createUser()
    const lotData = await createLotPublished({ ownerId: uData.user.id })

    const response = await getLotBetsRequest({ params: { id: lotData.lot.id } })

    const bets = await response.json()

    expect(bets.length).toBe(1)
    expect(bets[0].id).toBeDefined()
    expect(bets[0].amount).toBeDefined()
    expect(bets[0].createdAt).toBeDefined()
    expect(bets[0].user).toBeDefined()
    expect(bets[0].user.id).toBeDefined()
    expect(bets[0].user.username).toBeDefined()

    await lotData.clear()
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when a lot is not exists', async () => {
      const response = await getLotBetsRequest({ params: { id: 123456 } })

      expect(response.status).toBe(404)
    })
  })
})
