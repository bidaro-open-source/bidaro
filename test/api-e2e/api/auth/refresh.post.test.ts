import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { refreshRequest } from '~~/test/api-e2e/requests/authentication'

describe('POST /api/auth/refresh', async () => {
  it('should refresh session successfully with token in request body', async () => {
    const data = await createUser({ withSession: true })

    const response = await refreshRequest(
      { refresh_token: data.refresh_token },
      { useBody: true },
    )

    expect(response.status).toBe(200)

    await data.clear()
  })

  it('should refresh session successfully with token in cookie', async () => {
    const data = await createUser({ withSession: true })

    const response = await refreshRequest(
      { refresh_token: data.refresh_token },
      { useCookie: true },
    )

    expect(response.status).toBe(200)

    await data.clear()
  })

  describe('error handling', () => {
    it(
      'should return 422 when refresh token is missing from request body',
      async () => {
        const response = await refreshRequest(
          { refresh_token: '' },
          { useBody: true },
        )

        expect(response.status).toBe(422)
      },
    )

    it(
      'should return 422 when refresh token is missing from cookie',
      async () => {
        const response = await refreshRequest(
          { refresh_token: '' },
          { useCookie: true },
        )

        expect(response.status).toBe(422)
      },
    )

    it('should return 404 when attempting to reuse previous refresh token', async () => {
      const data = await createUser({ withSession: true })

      await refreshRequest(
        { refresh_token: data.refresh_token },
        { useBody: true },
      )

      const response = await refreshRequest(
        { refresh_token: data.refresh_token },
        { useBody: true },
      )

      expect(response.status).toBe(404)

      await data.clear()
    })
  })
})
