import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import '~~/test/api-e2e/setup-redis'
import '~~/test/api-e2e/setup-database'

async function getSessionsRequest(
  options: { accessToken: string },
) {
  return await fetch(`/api/profile/sessions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

describe('session fetching', async () => {
  await setup()

  it('should return user sessions', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_OWN_SESSIONS],
    })

    const response = await getSessionsRequest({
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0].uuid).toBe(data.session_uuid)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return error if user have not permissions', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await getSessionsRequest({
        accessToken: data.access_token,
      })

      expect(response.status).toBe(403)

      await data.clear()
    })
  })
})
