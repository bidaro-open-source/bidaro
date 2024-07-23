import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

interface LoginRequestBody {
  username: string
  password: string
}

interface LogoutRequestBody {
  accessToken: string
  refreshToken: string
}

async function makeLoginRequest(body: LoginRequestBody) {
  return await fetch('/api/auth/login', {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

async function makeLogoutRequest(body: LogoutRequestBody) {
  return await fetch('/api/auth/logout', {
    body: JSON.stringify({ refresh_token: body.refreshToken }),
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${body.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

describe('logout', async () => {
  await setup()

  it('should logout user', async () => {
    const user = await db.UserFactory.new().create()

    const loginResponse = await makeLoginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    const loginBody = await loginResponse.json()

    const response = await makeLogoutRequest({
      accessToken: loginBody.access_token,
      refreshToken: loginBody.refresh_token,
    })

    expect(response.status).toBe(200)

    await user.destroy()
  })

  describe('error handling', () => {
    it('should return error if no access token is provided', async () => {
      const user = await db.UserFactory.new().create()

      const loginResponse = await makeLoginRequest({
        username: user.username,
        password: db.UserFactory.password,
      })

      const loginBody = await loginResponse.json()

      const response = await makeLogoutRequest({
        accessToken: '',
        refreshToken: loginBody.refresh_token,
      })

      expect(response.status).toBe(401)

      await user.destroy()
    })

    it('should return error if no refresh token is provided', async () => {
      const user = await db.UserFactory.new().create()

      const loginResponse = await makeLoginRequest({
        username: user.username,
        password: db.UserFactory.password,
      })

      const loginBody = await loginResponse.json()

      const response = await makeLogoutRequest({
        accessToken: loginBody.access_token,
        // @ts-expect-error temp line
        refreshToken: undefined,
      })

      expect(response.status).toBe(422)

      await user.destroy()
    })

    it('should return error if refresh token not found', async () => {
      const user = await db.UserFactory.new().create()

      const loginResponse = await makeLoginRequest({
        username: user.username,
        password: db.UserFactory.password,
      })

      const loginBody = await loginResponse.json()

      const response = await makeLogoutRequest({
        accessToken: loginBody.access_token,
        refreshToken: `936acb91-9837-4d4c-a6ec-a6d02a72eb52`,
      })

      expect(response.status).toBe(404)

      await user.destroy()
    })

    it(
      'should return error if refresh token belongs to another user',
      async () => {
        const user1 = await db.UserFactory.new().create()
        const user2 = await db.UserFactory.new().create()

        const login1Response = await makeLoginRequest({
          username: user1.username,
          password: db.UserFactory.password,
        })

        const login2Response = await makeLoginRequest({
          username: user2.username,
          password: db.UserFactory.password,
        })

        const login1Body = await login1Response.json()

        const login2Body = await login2Response.json()

        const response = await makeLogoutRequest({
          accessToken: login1Body.access_token,
          refreshToken: login2Body.refresh_token,
        })

        expect(response.status).toBe(403)
      },
    )
  })
})
