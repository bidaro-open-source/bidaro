import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { logoutRequest } from '~~/test/api-e2e/requests/authentication'
import '~~/test/api-e2e/setup-redis'
import '~~/test/api-e2e/setup-database'

describe('logout', async () => {
  await setup()

  it('should logout user', async () => {
    const data = await createUser({ withSession: true })

    const response = await logoutRequest(
      { refresh_token: data.refresh_token },
      { accessToken: data.access_token },
    )

    expect(response.status).toBe(200)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return error if no access token is provided', async () => {
      const data = await createUser({ withSession: true })

      const response = await logoutRequest(
        { refresh_token: data.refresh_token },
        { accessToken: undefined },
      )

      expect(response.status).toBe(401)

      await data.clear()
    })

    it('should return error if no refresh token is provided', async () => {
      const data = await createUser({ withSession: true })

      const response = await logoutRequest(
        // @ts-expect-error not provide
        { refresh_token: undefined },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(422)

      await data.clear()
    })

    it('should return error if refresh token not found', async () => {
      const data = await createUser({ withSession: true })

      const response = await logoutRequest(
        { refresh_token: 'fff' },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(404)

      await data.clear()
    })

    it('should return error if refresh token belongs to another user', async () => {
      const user1 = await createUser({ withSession: true })
      const user2 = await createUser({ withSession: true })

      const response = await logoutRequest(
        { refresh_token: user2.refresh_token },
        { accessToken: user1.access_token },
      )

      expect(response.status).toBe(403)

      await user1.clear()
      await user2.clear()
    })
  })
})
