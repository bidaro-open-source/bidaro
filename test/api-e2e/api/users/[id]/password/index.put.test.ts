import type { UpdateUserPasswordRequest } from '~~/server/api/users/[id]/password/index.put.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { actionLimits, permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function updateUserPasswordRequest(
  payload: UpdateUserPasswordRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}/password`, {
    method: 'PUT',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PUT /api/users/:id/password', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should update user password successfully', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_OWN_PASSWORD],
    })

    const oldPasswordHash = userData.user.password

    const response = await updateUserPasswordRequest(
      {
        body: { password: db.UserFactory.newPassword },
        params: { id: userData.user.id },
      },
      { accessToken: userData.access_token },
    )

    await userData.user.reload()

    const newPasswordHash = userData.user.password

    expect(response.status).toBe(200)
    expect(oldPasswordHash).not.toBe(newPasswordHash)

    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()

      const response = await updateUserPasswordRequest(
        {
          body: { password: db.UserFactory.newPassword },
          params: { id: userData.user.id },
        },
      )

      expect(response.status).toBe(401)

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await updateUserPasswordRequest(
        {
          body: { password: db.UserFactory.newPassword },
          params: { id: userData.user.id },
        },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)

      await userData.clear()
    })

    it('should return 403 when updating another user\'s password', async () => {
      const userData1 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_OWN_PASSWORD],
      })
      const userData2 = await createUser()

      const response = await updateUserPasswordRequest(
        {
          body: { password: db.UserFactory.newPassword },
          params: { id: userData2.user.id },
        },
        { accessToken: userData1.access_token },
      )

      expect(response.status).toBe(403)

      await userData2.clear()
      await userData1.clear()
    })

    it('should return 429 when the user has exceeded the daily limit', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_OWN_PASSWORD],
      })

      for (let i = 0; i < actionLimits.UPDATE_PASSWORD; i++) {
        const response = await updateUserPasswordRequest(
          {
            body: { password: db.UserFactory.newPassword },
            params: { id: userData.user.id },
          },
          { accessToken: userData.access_token },
        )

        expect(response.status).toBe(200)
      }

      const response = await updateUserPasswordRequest(
        {
          body: { password: db.UserFactory.newPassword },
          params: { id: userData.user.id },
        },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(429)

      await userData.clear()
    })
  })
})
