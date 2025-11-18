import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { REFRESH_TOKEN_COOKIE_NAME } from '~~/server/utils/refresh-token-cookie'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { loginRequest } from '~~/test/api-e2e/requests/authentication'

describe('POST /api/auth/login', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should authenticate user successfully with valid credentials', async () => {
    const data = await createUser()

    const response = await loginRequest({
      username: data.user.username,
      password: db.UserFactory.password,
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.user.email).toBe(data.user.email)
    expect(body.user.username).toBe(data.user.username)

    await data.clear()
  })

  it('should return both access and refresh tokens in response body', async () => {
    const data = await createUser()

    const response = await loginRequest({
      username: data.user.username,
      password: db.UserFactory.password,
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(typeof body.access_token).toBe('string')
    expect(typeof body.refresh_token).toBe('string')

    await data.clear()
  })

  it('should set refresh token in HTTP-only cookie', async () => {
    const data = await createUser()

    const response = await loginRequest({
      username: data.user.username,
      password: db.UserFactory.password,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).match(
      new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=`),
    )

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 404 when username does not exist', async () => {
      const response = await loginRequest({
        username: db.UserFactory.invalidUsername,
        password: db.UserFactory.invalidPassword,
      })

      expect(response.status).toBe(404)
    })

    it('should return 422 when password is incorrect', async () => {
      const data = await createUser()

      const response = await loginRequest({
        username: data.user.username,
        password: db.UserFactory.invalidPassword,
      })

      expect(response.status).toBe(422)

      await data.clear()
    })
  })
})
