import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import {
  destroyUser,
  refreshRequest,
  registerUser,
} from '~/test/utils/requests/authentication'

describe('refresh', async () => {
  await setup()

  it('should refresh session with refresh token in body', async () => {
    const data = await registerUser()

    const response = await refreshRequest(
      { refresh_token: data.refresh_token },
      { useBody: true },
    )

    expect(response.status).toBe(200)

    await destroyUser(data.user.id)
  })

  it('should refresh session with refresh token in cookie', async () => {
    const data = await registerUser()

    const response = await refreshRequest(
      { refresh_token: data.refresh_token },
      { useCookie: true },
    )

    expect(response.status).toBe(200)

    await destroyUser(data.user.id)
  })

  describe('error handling', () => {
    it(
      'should return error if refresh token is not provided in body',
      async () => {
        const response = await refreshRequest(
          { refresh_token: '' },
          { useBody: true },
        )

        expect(response.status).toBe(422)
      },
    )

    it(
      'should return error if refresh token is not provided in cookie',
      async () => {
        const response = await refreshRequest(
          { refresh_token: '' },
          { useCookie: true },
        )

        expect(response.status).toBe(422)
      },
    )

    it('should return error when sending previous refresh token', async () => {
      const data = await registerUser()

      await refreshRequest(
        { refresh_token: data.refresh_token },
        { useBody: true },
      )

      const response = await refreshRequest(
        { refresh_token: data.refresh_token },
        { useBody: true },
      )

      expect(response.status).toBe(404)

      await destroyUser(data.user.id)
    })
  })
})
