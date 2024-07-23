import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { REFRESH_TOKEN_COOKIE_NAME } from '~/server/utils/refresh-token-cookie'
import {
  destroyUser,
  loginRequest,
  registerUser,
} from '~/test/utils/requests/authentication'

describe('login', async () => {
  await setup()

  it('should return user fields', async () => {
    const data = await registerUser()

    const response = await loginRequest({
      username: data.user.username,
      password: db.UserFactory.password,
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.user.id).toBe(data.user.id)
    expect(body.user.email).toBe(data.user.email)
    expect(body.user.username).toBe(data.user.username)

    await destroyUser(data.user.id)
  })

  it('should return pair of access and refresh tokens', async () => {
    const data = await registerUser()

    const response = await loginRequest({
      username: data.user.username,
      password: db.UserFactory.password,
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(typeof body.access_token).toBe('string')
    expect(typeof body.refresh_token).toBe('string')

    await destroyUser(data.user.id)
  })

  it('should returns refresh token in cookie', async () => {
    const data = await registerUser()

    const response = await loginRequest({
      username: data.user.username,
      password: db.UserFactory.password,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).match(
      new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=`),
    )

    await destroyUser(data.user.id)
  })

  describe('error handling', () => {
    it('should return error if username not exists', async () => {
      const response = await loginRequest({
        username: db.UserFactory.invalidUsername,
        password: db.UserFactory.invalidPassword,
      })

      expect(response.status).toBe(404)
    })

    it('should return error if password is incorrect', async () => {
      const data = await registerUser()

      const response = await loginRequest({
        username: data.user.username,
        password: db.UserFactory.invalidPassword,
      })

      expect(response.status).toBe(422)

      await destroyUser(data.user.id)
    })
  })
})
