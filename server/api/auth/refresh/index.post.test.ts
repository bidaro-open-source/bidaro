import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { refreshRequest } from '~~/test/api-e2e/requests/authentication'
import '~~/test/api-e2e/setup-redis'
import '~~/test/api-e2e/setup-database'

describe('refresh', async () => {
  await setup()

  it('should refresh session with refresh token in body', async () => {
    const data = await createUser({ withSession: true })

    const response = await refreshRequest(
      { refresh_token: data.refresh_token },
      { useBody: true },
    )

    expect(response.status).toBe(200)

    await data.clear()
  })

  it('should refresh session with refresh token in cookie', async () => {
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
