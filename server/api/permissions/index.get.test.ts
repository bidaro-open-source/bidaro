import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function getPermissionsRequest(options: { accessToken?: string } = {}) {
  return await fetch(`/api/permissions`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/permissions', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should retrieve permissions with correct structure', async () => {
    const uData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_PERMISSIONS],
    })

    const response = await getPermissionsRequest({ accessToken: uData.access_token })

    const permission = response._data ? response._data[0] : null

    expect(response.status).toBe(200)
    expect(permission).toHaveProperty('name')
    expect(permission).toHaveProperty('displayName')
    expect(permission).toHaveProperty('description')

    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await getPermissionsRequest()

      expect(response.status).toBe(401)
    })

    it('should return 403 when user lacks required permission', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await getPermissionsRequest({ accessToken: uData.access_token })

      expect(response.status).toBe(403)

      await uData.clear()
    })
  })
})
