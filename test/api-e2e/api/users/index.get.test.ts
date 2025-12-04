import type { ViewUsersRequest } from '~~/server/api/users/index.get.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewUsersRequest(
  payload: { query?: Partial<ViewUsersRequest['query']> } = {},
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users`, {
    method: 'GET',
    query: payload.query,
    accessToken: options.accessToken,
  })
}

describe('GET /api/users', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should retrieve users correct structure', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_USERS],
    })

    const response = await viewUsersRequest(
      {},
      { accessToken: data.access_token },
    )

    const meta = response._data?.meta ? response._data.meta : {}
    const users = Array.isArray(response._data?.data) ? response._data.data : []

    expect(response.status).toBe(200)

    expect(meta).toHaveProperty('totalItems')
    expect(meta).toHaveProperty('currentPage')
    expect(meta).toHaveProperty('itemsPerPage')

    expect(users[0]).toHaveProperty('id')
    expect(users[0]).toHaveProperty('name')
    expect(users[0]).toHaveProperty('surname')
    expect(users[0]).toHaveProperty('username')
    expect(users[0]).toHaveProperty('email')
    expect(users[0]).toHaveProperty('emailVerifiedAt')
    expect(users[0]).toHaveProperty('roleName')
    expect(users[0]).toHaveProperty('createdAt')
    expect(users[0]).toHaveProperty('updatedAt')

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()

      const response = await viewUsersRequest()

      expect(response.status).toBe(401)

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await viewUsersRequest(
        {},
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)

      await userData.clear()
    })
  })
})
