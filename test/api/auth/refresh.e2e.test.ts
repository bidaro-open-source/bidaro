import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import type { RequestBody } from '~/server/requests/auth/login.post'

interface RefreshRequestBody {
  refreshToken: string
  useCookie?: boolean
  useBody?: boolean
}

async function makeLoginRequest(body: RequestBody) {
  return await fetch('/api/auth/login', {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

async function makeRefreshRequest(body: RefreshRequestBody) {
  return await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': body.useCookie ? `jwt=${body.refreshToken}` : '',
    },
    body: body.useBody
      ? JSON.stringify({ refresh_token: body.refreshToken })
      : null,
  })
}

describe('refresh', async () => {
  await setup()

  it('should refresh session with refresh token in body', async () => {
    const user = await db.UserFactory.new().create()

    const loginResponse = await makeLoginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    const loginBody = await loginResponse.json()

    const response = await makeRefreshRequest({
      refreshToken: loginBody.refresh_token,
      useBody: true,
    })

    expect(response.status).toBe(200)

    await user.destroy()
  })

  it('should refresh session with refresh token in cookie', async () => {
    const user = await db.UserFactory.new().create()

    const loginResponse = await makeLoginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    const loginBody = await loginResponse.json()

    const response = await makeRefreshRequest({
      refreshToken: loginBody.refresh_token,
      useCookie: true,
    })

    expect(response.status).toBe(200)

    await user.destroy()
  })

  describe('error handling', () => {
    it('should return error if refresh token is not provided', async () => {
      const response = await makeRefreshRequest({
        refreshToken: '',
        useCookie: false,
        useBody: false,
      })

      expect(response.status).toBe(422)
    })

    it('should return error when sending previous refresh token', async () => {
      const user = await db.UserFactory.new().create()

      const loginResponse = await makeLoginRequest({
        username: user.username,
        password: db.UserFactory.password,
      })

      const loginBody = await loginResponse.json()

      await makeRefreshRequest({
        refreshToken: loginBody.refresh_token,
        useCookie: true,
      })

      const response = await makeRefreshRequest({
        refreshToken: loginBody.refresh_token,
        useCookie: true,
      })

      expect(response.status).toBe(404)

      await user.destroy()
    })
  })
})
