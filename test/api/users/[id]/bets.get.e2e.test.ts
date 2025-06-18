import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { getUserBetsRequest } from '~~/test/utils/requests/users'

describe('get /api/users/:id/bets', async () => {
  await setup()

  describe('error handling', () => {
    it('should return 404 when user is not exists', async () => {
      const response = await getUserBetsRequest({ params: { id: 123 } })

      expect(response.status).toBe(404)
    })
  })
})
