import type { UpdateUserEmailRequest } from '~~/server/api/users/[id]/email/index.put.request'
import { describe, expect, it } from 'vitest'
import { actionLimits, permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function updateUserEmailRequest(
  payload: UpdateUserEmailRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}/email`, {
    method: 'PUT',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PUT /api/users/:id/email', async () => {
  it('should update user email successfully', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_OWN_EMAIL],
    })

    const { email } = db.UserFactory.new().make()

    const response = await updateUserEmailRequest(
      {
        body: { email },
        params: { id: userData.user.id },
      },
      { accessToken: userData.access_token },
    )

    await userData.user.reload()

    expect(response.status).toBe(200)
    expect(userData.user.email).toBe(email)

    await userData.clear()
  })

  it('should reset email verification successfully', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_OWN_EMAIL],
    })

    userData.user.emailVerifiedAt = new Date()
    await userData.user.save()

    const { email } = db.UserFactory.new().make()

    const response = await updateUserEmailRequest(
      {
        body: { email },
        params: { id: userData.user.id },
      },
      { accessToken: userData.access_token },
    )

    await userData.user.reload()

    expect(response.status).toBe(200)
    expect(userData.user.emailVerifiedAt).toBe(null)

    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()

      const { email } = db.UserFactory.new().make()

      const response = await updateUserEmailRequest(
        {
          body: { email },
          params: { id: userData.user.id },
        },
      )

      expect(response.status).toBe(401)
      expect(response._data.data.code).toBe('AUTHENTICATION_REQUIRED')

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const { email } = db.UserFactory.new().make()

      const response = await updateUserEmailRequest(
        {
          body: { email },
          params: { id: userData.user.id },
        },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.data.code).toBe('FORBIDDEN')

      await userData.clear()
    })

    it('should return 403 when updating another user\'s email', async () => {
      const userData1 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_OWN_EMAIL],
      })
      const userData2 = await createUser()

      const { email } = db.UserFactory.new().make()

      const response = await updateUserEmailRequest(
        {
          body: { email },
          params: { id: userData2.user.id },
        },
        { accessToken: userData1.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.data.code).toBe('FORBIDDEN')

      await userData2.clear()
      await userData1.clear()
    })

    it('should return 400 when email is already in use by another user', async () => {
      const userData1 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_OWN_EMAIL],
      })
      const userData2 = await createUser()

      const response = await updateUserEmailRequest(
        {
          body: { email: userData2.user.email },
          params: { id: userData1.user.id },
        },
        { accessToken: userData1.access_token },
      )

      expect(response.status).toBe(422)
      expect(response._data.data.code).toBe('VALIDATION_ERROR')

      await userData2.clear()
      await userData1.clear()
    })

    it('should return 429 when the user has exceeded the daily limit', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_OWN_EMAIL],
      })

      for (let i = 0; i < actionLimits.UPDATE_EMAIL; i++) {
        const { email } = db.UserFactory.new().make()

        const response = await updateUserEmailRequest(
          {
            body: { email },
            params: { id: userData.user.id },
          },
          { accessToken: userData.access_token },
        )

        expect(response.status).toBe(200)
      }

      const { email } = db.UserFactory.new().make()

      const response = await updateUserEmailRequest(
        {
          body: { email },
          params: { id: userData.user.id },
        },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(429)

      await userData.clear()
    })
  })
})
