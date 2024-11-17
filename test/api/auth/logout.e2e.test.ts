import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import {
  destroyUser,
  logoutRequest,
  registerUser,
} from '~/test/utils/requests/authentication'

describe('logout', async () => {
  await setup()

  it('should logout user', async () => {
    const data = await registerUser()

    const response = await logoutRequest(
      { refresh_token: data.refresh_token },
      { accessToken: data.access_token },
    )

    expect(response.status).toBe(200)

    await destroyUser(data.user.id)
  })

  describe('error handling', () => {
    it('should return error if no access token is provided', async () => {
      const data = await registerUser()

      const response = await logoutRequest(
        { refresh_token: data.refresh_token },
        // @ts-expect-error not provide
        { accessToken: undefined },
      )

      expect(response.status).toBe(401)

      await destroyUser(data.user.id)
    })

    it('should return error if no refresh token is provided', async () => {
      const data = await registerUser()

      const response = await logoutRequest(
        // @ts-expect-error not provide
        { refresh_token: undefined },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(422)

      await destroyUser(data.user.id)
    })

    it('should return error if refresh token not found', async () => {
      const data = await registerUser()

      const response = await logoutRequest(
        { refresh_token: 'fff' },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(404)

      await destroyUser(data.user.id)
    })

    it(
      'should return error if refresh token belongs to another user',
      async () => {
        const user1 = await registerUser()
        const user2 = await registerUser()

        const response = await logoutRequest(
          { refresh_token: user2.refresh_token },
          { accessToken: user1.access_token },
        )

        expect(response.status).toBe(403)

        await destroyUser(user1.user.id)
        await destroyUser(user2.user.id)
      },
    )
  })
})
