import type { UpdateProfileRequest } from './index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function updateProfileRequest(
  payload: UpdateProfileRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/profile`, {
    method: 'PATCH',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PATCH /api/profile', async () => {
  await setup({ host: env.SETUP_HOST })

  describe('should update profile', () => {
    it.each([
      ['name', 'Updated Name'],
      ['surname', 'Updated Surname'],
    ])(
      'by key "%s" with value "%s"',
      async (key: string, value: string) => {
        const data = await createUser({
          withSession: true,
        })

        const response = await updateProfileRequest(
          { body: { [key]: value } },
          { accessToken: data.access_token },
        )

        const updatedProfile = response._data

        expect(response.status).toBe(200)
        expect(updatedProfile[key]).toBe(value)

        await data.clear()
      },
    )

    it('by key "email"', async () => {
      const data = await createUser({
        withSession: true,
      })

      const newEmail = 'newemail@example.com'

      const response = await updateProfileRequest(
        { body: { email: newEmail } },
        { accessToken: data.access_token },
      )

      const updatedProfile = response._data

      expect(response.status).toBe(200)
      expect(updatedProfile.email).toBe(newEmail)
      expect(updatedProfile.emailVerifiedAt).toBe(null)

      await data.clear()
    })

    it('by key "password"', async () => {
      const data = await createUser({
        withSession: true,
      })

      const response = await updateProfileRequest(
        { body: { password: 'NewPassword123!' } },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(200)

      await data.clear()
    })
  })

  it('should update multiple fields simultaneously', async () => {
    const data = await createUser({
      withSession: true,
    })

    const response = await updateProfileRequest(
      {
        body: {
          name: 'New Name',
          surname: 'New Surname',
        },
      },
      { accessToken: data.access_token },
    )

    const updatedProfile = response._data

    expect(response.status).toBe(200)
    expect(updatedProfile.name).toBe('New Name')
    expect(updatedProfile.surname).toBe('New Surname')

    await data.clear()
  })

  it('should reset emailVerifiedAt when email is changed', async () => {
    const data = await createUser({
      withSession: true,
    })

    // Set emailVerifiedAt to a value first
    data.user.emailVerifiedAt = new Date().toISOString()
    await data.user.save()

    const response = await updateProfileRequest(
      { body: { email: 'changedmail@example.com' } },
      { accessToken: data.access_token },
    )

    const updatedProfile = response._data

    expect(response.status).toBe(200)
    expect(updatedProfile.emailVerifiedAt).toBe(null)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await updateProfileRequest({
        body: { name: 'New Name' },
      })

      expect(response.status).toBe(401)
    })

    it('should return 422 when email is already in use by another user', async () => {
      const data1 = await createUser()
      const data2 = await createUser({
        withSession: true,
      })

      const response = await updateProfileRequest(
        { body: { email: data1.user.email } },
        { accessToken: data2.access_token },
      )

      expect(response.status).toBe(422)

      await data2.clear()
      await data1.clear()
    })

    it('should return 422 when attempting to update username', async () => {
      const data = await createUser({
        withSession: true,
      })

      const response = await updateProfileRequest(
        { body: { username: 'newusername' } as any },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(422)

      await data.clear()
    })
  })
})
