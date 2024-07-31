import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { REFRESH_TOKEN_COOKIE_NAME } from '~/server/utils/refresh-token-cookie'
import {
  destroyUser,
  registerRequest,
} from '~/test/utils/requests/authentication'

describe('register', async () => {
  await setup()

  it('should register user', async () => {
    const userData = db.UserFactory.new().make()

    const response = await registerRequest({
      email: userData.email,
      username: userData.username,
      password: db.UserFactory.password,
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(typeof body.user.id).toBe('number')
    expect(body.user.email).toBe(userData.email)
    expect(body.user.username).toBe(userData.username)

    await destroyUser(body.user.id)
  })

  it('should return pair of tokens', async () => {
    const userData = db.UserFactory.new().make()

    const response = await registerRequest({
      email: userData.email,
      username: userData.username,
      password: db.UserFactory.password,
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(typeof body.access_token).toBe('string')
    expect(typeof body.refresh_token).toBe('string')

    await destroyUser(body.user.id)
  })

  it('should return refresh token in cookie', async () => {
    const userData = db.UserFactory.new().make()

    const response = await registerRequest({
      email: userData.email,
      username: userData.username,
      password: db.UserFactory.password,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).match(
      new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=`),
    )

    const body = await response.json()

    await destroyUser(body.user.id)
  })

  describe('registration with valid email', () => {
    it.each([
      'email@example.com',
      'firstname.lastname@example.com',
      'email@subdomain.example.com',
      'firstname+lastname@example.com',
    ])('should register user when email is "%s"', async (email) => {
      const userData = db.UserFactory.new().make()

      const response = await registerRequest({
        password: db.UserFactory.password,
        username: userData.username,
        email,
      })

      const body = await response.json()

      expect(response.status).toBe(200)

      await destroyUser(body.user.id)
    })
  })

  describe('registration with valid username', () => {
    it.each([
      'user',
      'user123',
      'user_123',
      '123user',
      '123_user',
      '_user_',
      '_u_s_e_r_',
      '_____u',
      'u_____',
    ])('should register user when username is "%s"', async (username) => {
      const userData = db.UserFactory.new().make()

      const response = await registerRequest({
        password: db.UserFactory.password,
        email: userData.email,
        username,
      })

      const body = await response.json()

      expect(response.status).toBe(200)

      await destroyUser(body.user.id)
    })
  })

  describe('error handling of already taken fields', () => {
    it('should return error when email already taken', async () => {
      const userData = db.UserFactory.new().make()
      const userCreated = await db.UserFactory.new().create()

      const response = await registerRequest({
        email: userCreated.email,
        username: userData.username,
        password: userData.password,
      })

      expect(response.status).toBe(422)
    })

    it('should return error when username already taken', async () => {
      const userData = db.UserFactory.new().make()
      const userCreated = await db.UserFactory.new().create()

      const response = await registerRequest({
        email: userData.email,
        username: userCreated.username,
        password: userData.password,
      })

      expect(response.status).toBe(422)
    })
  })

  describe('error handling of invalid email', () => {
    it.each([
      undefined,
      '',
      ' ',
      '  ',
      'ㅤㅤㅤㅤ',
      'a',
      `${'a'.repeat(245)}@gmail.com`,
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'Joe Smith <email@example.com>',
      'email.example.com',
      'email@example@example.com',
      '.email@example.com',
      'email.@example.com',
      'email..email@example.com',
      'あいうえお@example.com',
      'email@example.com (Joe Smith)',
      'email@example',
      'email@-example.com',
      'email@111.222.333.44444',
      'email@example..com',
      'Abc..123@example.com',
      '”(),:;<>[\]@example.com',
      'just”not”right@example.com',
      'this\ is"really"not\allowed@example.com',
      'email@123.123.123.123',
      'email@[123.123.123.123]',
      '"email"@example.com',
      '"1234567890@example.com',
      '"email@example-one.com',
      '"_______@example.com',
      '"email@example.name',
      '"email@example.museum',
      '"email@example.co.jp',
      '"firstname-lastname@example.com',
    ])('should return error when email is "%s"', async (email) => {
      const userData = db.UserFactory.new().make()

      const response = await registerRequest({
        username: userData.username,
        password: userData.password,
        email: email as string,
      })

      expect(response.status).toBe(422)
    })
  })

  describe('error handling of invalid username', () => {
    it.each([
      undefined,
      '',
      ' ',
      '  ',
      'ㅤ',
      'a',
      'a'.repeat(25),
      '123',
      '_12',
      '___',
      'abc!',
      '!@#$%^&*()abc',
      'a b c',
      'abc-def',
      'абвгдеёжзий',
      '中文字符',
    ])('should return error when username is "%s"', async (username) => {
      const userData = db.UserFactory.new().make()

      const response = await registerRequest({
        email: userData.email,
        password: userData.password,
        username: username as string,
      })

      expect(response.status).toBe(422)
    })
  })

  describe('error handling of invalid password', () => {
    it.each([
      undefined,
      '',
      ' ',
      '  ',
      'a'.repeat(65),
    ])('should return error when password is "%s"', async (password) => {
      const userData = db.UserFactory.new().make()

      const response = await registerRequest({
        email: userData.email,
        username: userData.username,
        password: password as string,
      })

      expect(response.status).toBe(422)
    })
  })
})
