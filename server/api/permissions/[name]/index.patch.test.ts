import type { UpdatePermissionRequest } from './index.patch.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewPermissionRequest(
  payload: UpdatePermissionRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/permissions/${payload.params.name}`, {
    method: 'PATCH',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PATCH /api/permissions/:id', async () => {
  await setup({ host: env.SETUP_HOST })

  const displayName = 'new display name'
  const description = 'new description'

  it('should update permission successfully', async () => {
    const uData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_PERMISSIONS],
    })

    const response = await viewPermissionRequest(
      {
        body: { displayName, description },
        params: { name: permissions.UPDATE_PERMISSIONS },
      },
      { accessToken: uData.access_token },
    )

    const permission = response._data

    expect(response.status).toBe(200)
    expect(permission).toHaveProperty('name')
    expect(permission.displayName).toBe(displayName)
    expect(permission.description).toBe(description)

    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await viewPermissionRequest(
        {
          body: { displayName, description },
          params: { name: permissions.UPDATE_PERMISSIONS },
        },
      )

      expect(response.status).toBe(401)
    })

    it('should return 403 when user lacks required permission', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await viewPermissionRequest(
        {
          body: { displayName, description },
          params: { name: permissions.UPDATE_PERMISSIONS },
        },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(403)

      await uData.clear()
    })
  })
})
