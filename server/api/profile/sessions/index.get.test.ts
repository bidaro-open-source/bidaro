import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function getSessionsRequest(
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/profile/sessions`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/profile/sessions', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should retrieve user sessions successfully', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_OWN_SESSIONS],
    })

    const response = await getSessionsRequest({
      accessToken: data.access_token,
    })

    const sessions = response._data

    expect(response.status).toBe(200)
    expect(sessions[0].uuid).toBe(data.session_uuid)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await getSessionsRequest()

      expect(response.status).toBe(401)
    })

    it('should return 403 when user lacks required permission', async () => {
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
