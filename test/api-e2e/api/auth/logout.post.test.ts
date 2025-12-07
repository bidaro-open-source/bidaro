import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { logoutRequest } from '~~/test/api-e2e/requests/authentication'

describe('POST /api/auth/logout', async () => {
  it('should terminate user session successfully', async () => {
    const data = await createUser({ withSession: true })

    const response = await logoutRequest(
      { refresh_token: data.refresh_token },
      { accessToken: data.access_token },
    )

    expect(response.status).toBe(200)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when access token is not provided', async () => {
      const data = await createUser({ withSession: true })

      const response = await logoutRequest(
        { refresh_token: data.refresh_token },
        { accessToken: undefined },
      )

      expect(response.status).toBe(401)
      expect(response._data.code).toBe('AUTHENTICATION_REQUIRED')
      expect(response._data.code).toBe('AUTHENTICATION_REQUIRED')

      await data.clear()
    })

    it('should return 422 when refresh token is not provided', async () => {
      const data = await createUser({ withSession: true })

      const response = await logoutRequest(
        // @ts-expect-error not provide
        { refresh_token: undefined },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(422)
      expect(response._data.code).toBe('VALIDATION_ERROR')
      expect(response._data.code).toBe('VALIDATION_ERROR')

      await data.clear()
    })

    it('should return 404 when refresh token does not exist', async () => {
      const data = await createUser({ withSession: true })

      const response = await logoutRequest(
        { refresh_token: 'fff' },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(404)
      expect(response._data.code).toBe('REFRESH_TOKEN_NOT_FOUND')
      expect(response._data.code).toBe('REFRESH_TOKEN_NOT_FOUND')

      await data.clear()
    })

    it('should return 403 when refresh token belongs to a different user', async () => {
      const user1 = await createUser({ withSession: true })
      const user2 = await createUser({ withSession: true })

      const response = await logoutRequest(
        { refresh_token: user2.refresh_token },
        { accessToken: user1.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.code).toBe('REFRESH_TOKEN_ACCESS_DENIED')
      expect(response._data.code).toBe('REFRESH_TOKEN_ACCESS_DENIED')

      await user1.clear()
      await user2.clear()
    })
  })
})
