import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../utils/expect-api-error'

async function clearCacheRequest(options: { accessToken?: string } = {}) {
  return await fetch(`/api/cache`, {
    method: 'DELETE',
    accessToken: options.accessToken,
  })
}

describe('DELETE /api/cache', async () => {
  it('should clear cache successfully', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CLEAR_CACHE],
    })

    const response = await clearCacheRequest(
      { accessToken: userData.access_token },
    )

    expect(response.status).toBe(204)

    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await clearCacheRequest()

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await clearCacheRequest(
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await userData.clear()
    })
  })
})
