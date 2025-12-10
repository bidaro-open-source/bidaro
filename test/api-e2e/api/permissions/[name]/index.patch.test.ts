import type { UpdatePermissionRequest } from '../../../../../server/api/permissions/[name]/index.patch.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../utils/expect-api-error'

async function updatePermissionRequest(
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
  const displayName = 'new display name'
  const description = 'new description'

  it('should update permission successfully', async () => {
    const uData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_PERMISSIONS],
    })

    const response = await updatePermissionRequest(
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
      const response = await updatePermissionRequest(
        {
          body: { displayName, description },
          params: { name: permissions.UPDATE_PERMISSIONS },
        },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await updatePermissionRequest(
        {
          body: { displayName, description },
          params: { name: permissions.UPDATE_PERMISSIONS },
        },
        { accessToken: uData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await uData.clear()
    })

    it('should return 404 when permission not exist', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_PERMISSIONS],
      })

      const response = await updatePermissionRequest(
        {
          body: { displayName, description },
          params: { name: 'non_existing_permission' },
        },
        { accessToken: uData.access_token },
      )

      expectApiError(response, 'PERMISSION_NOT_FOUND')

      await uData.clear()
    })
  })
})
