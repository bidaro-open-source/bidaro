import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { REFRESH_TOKEN_COOKIE_NAME } from '~/server/utils/refresh-token-cookie'
import type { RequestBody } from '~/server/requests/auth/login.post'

async function makeLoginRequest(body: RequestBody) {
  return await fetch('/api/auth/login', {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('login', async () => {
  await setup()

  it('should return user fields', async () => {
    const user = await db.UserFactory.new().create()

    const response = await makeLoginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.user.email).toBe(user.email)
    expect(body.user.username).toBe(user.username)
    expect(typeof body.user.id).toBe('number')

    await user.destroy()
  })

  it('should return pair of access and refresh tokens', async () => {
    const user = await db.UserFactory.new().create()

    const response = await makeLoginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(typeof body.access_token).toBe('string')
    expect(typeof body.refresh_token).toBe('string')

    await user.destroy()
  })

  it('should returns refresh token in cookie', async () => {
    const user = await db.UserFactory.new().create()

    const response = await makeLoginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).match(
      new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=`),
    )

    await user.destroy()
  })

  describe('error handling', () => {
    it('should return error if username not exists', async () => {
      const response = await makeLoginRequest({
        username: db.UserFactory.invalidUsername,
        password: db.UserFactory.invalidPassword,
      })

      expect(response.status).toBe(404)
    })

    it('should return error if password is incorrect', async () => {
      const user = await db.UserFactory.new().create()

      const response = await makeLoginRequest({
        username: user.username,
        password: db.UserFactory.invalidPassword,
      })

      expect(response.status).toBe(422)

      await user.destroy()
    })
  })
})
