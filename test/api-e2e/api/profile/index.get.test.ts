import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewProfileRequest(
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/profile`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/profile', async () => {
  it('should retrieve authenticated user profile successfully', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
    })

    const response = await viewProfileRequest({
      accessToken: data.access_token,
    })

    const profile = response._data

    expect(response.status).toBe(200)
    expect(profile.id).toBe(data.user.id)
    expect(profile.email).toBe(data.user.email)
    expect(profile.username).toBe(data.user.username)
    expect(profile.name).toBe(data.user.name)
    expect(profile.surname).toBe(data.user.surname)
    expect(profile.emailVerifiedAt).toBe(data.user.emailVerifiedAt)

    await data.clear()
  })

  it('should include role information in profile', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
    })

    const response = await viewProfileRequest({
      accessToken: data.access_token,
    })

    const profile = response._data

    expect(response.status).toBe(200)
    expect(profile.role).toBeDefined()
    expect(profile.role.displayName).toBe(data.role.displayName)
    expect(profile.role.description).toBe(data.role.description)

    await data.clear()
  })

  it('should include permissions array in profile', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_OWN_SESSIONS],
    })

    const response = await viewProfileRequest({
      accessToken: data.access_token,
    })

    const profile = response._data

    expect(response.status).toBe(200)
    expect(Array.isArray(profile.permissions)).toBe(true)
    expect(profile.permissions.length).toBeGreaterThan(0)
    expect(profile.permissions[0]).toHaveProperty('name')
    expect(profile.permissions[0]).toHaveProperty('displayName')
    expect(profile.permissions[0]).toHaveProperty('description')

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await viewProfileRequest()

      expect(response.status).toBe(401)
    })
  })
})
