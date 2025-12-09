import type { UpdateUserPasswordRequest } from '~~/server/api/users/[id]/password/index.put.request'
import { describe, expect, it } from 'vitest'
import { actionLimits, permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../../utils/expect-api-error'

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

      expectApiError(response, 'AUTHENTICATION_REQUIRED')

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

      expectApiError(response, 'FORBIDDEN')

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

      expectApiError(response, 'FORBIDDEN')

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
