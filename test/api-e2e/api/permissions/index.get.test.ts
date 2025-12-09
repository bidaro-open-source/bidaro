import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../utils/expect-error'


async function viewPermissionsRequest(options: { accessToken?: string } = {}) {
  return await fetch(`/api/permissions`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/permissions', async () => {
  it('should retrieve permissions with correct structure', async () => {
    const uData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_PERMISSIONS],
    })

    const response = await viewPermissionsRequest({ accessToken: uData.access_token })

    const permission = response._data ? response._data[0] : null

    expect(response.status).toBe(200)
    expect(permission).toHaveProperty('name')
    expect(permission).toHaveProperty('displayName')
    expect(permission).toHaveProperty('description')

    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await viewPermissionsRequest()

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await viewPermissionsRequest({ accessToken: uData.access_token })

      expectApiError(response, 'FORBIDDEN')

      await uData.clear()
    })
  })
})
