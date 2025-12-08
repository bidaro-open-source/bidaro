import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewRolesRequest(options: { accessToken?: string } = {}) {
  return await fetch(`/api/roles`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/roles', async () => {
  it('should return all roles', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_ROLES],
    })

    const response = await viewRolesRequest({ accessToken: userData.access_token })

    expect(response.status).toBe(200)
    expect(Array.isArray(response._data)).toBe(true)
    expect(response._data.length).toBeGreaterThan(0)
    expect(response._data[0]).toHaveProperty('name')
    expect(response._data[0]).toHaveProperty('displayName')
    expect(response._data[0]).toHaveProperty('description')

    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await viewRolesRequest()

      expect(response.status).toBe(401)
      expect(response._data.data.code).toBe('AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await viewRolesRequest({ accessToken: userData.access_token })

      expect(response.status).toBe(403)
      expect(response._data.data.code).toBe('FORBIDDEN')

      await userData.clear()
    })
  })
})
