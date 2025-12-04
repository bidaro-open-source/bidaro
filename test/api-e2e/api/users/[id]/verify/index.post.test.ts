import type { VerifyUserRequest } from '../../../../../../server/api/users/[id]/verify/index.post.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function verifyUserRequest(
  payload: VerifyUserRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}/verify`, {
    method: 'POST',
    accessToken: options.accessToken,
  })
}

describe('POST /api/users/:id/verify', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should verify user email successfully', async () => {
    const userData = await createUser()
    const adminData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VERIFY_USER],
    })

    await userData.user.update({ emailVerifiedAt: null })

    const response = await verifyUserRequest(
      { params: { id: userData.user.id } },
      { accessToken: adminData.access_token },
    )

    const user = response._data

    expect(response.status).toBe(200)
    expect(user.id).toBe(userData.user.id)

    await userData.user.reload()

    expect(userData.user.emailVerifiedAt).not.toBeNull()

    await userData.clear()
    await adminData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()

      const response = await verifyUserRequest({
        params: { id: userData.user.id },
      })

      expect(response.status).toBe(401)

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser()
      const adminData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await verifyUserRequest(
        { params: { id: userData.user.id } },
        { accessToken: adminData.access_token },
      )

      expect(response.status).toBe(403)

      await userData.clear()
      await adminData.clear()
    })

    it('should return 404 when user does not exist', async () => {
      const adminData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.VERIFY_USER],
      })

      const response = await verifyUserRequest(
        { params: { id: 93475937459 } },
        { accessToken: adminData.access_token },
      )

      expect(response.status).toBe(404)

      await adminData.clear()
    })
  })
})
