import { env } from 'node:process'
import { describe, expect, it } from 'vitest'
import { REFRESH_TOKEN_COOKIE_NAME } from '~~/server/utils/refresh-token-cookie'
import { createChallengeInvalidToken } from '~~/test/api-e2e/arrangers/challenge/create-challenge-invalid-token'
import { createChallengeToken } from '~~/test/api-e2e/arrangers/challenge/create-challenge-token'
import { destroyUser, registerRequest } from '~~/test/api-e2e/requests/authentication'

const CAPTCHA_ENABLED = env.NUXT_CHALLENGE_ENABLED === 'true'

describe('POST /api/auth/register', async () => {
  it('should register new user successfully with valid credentials', async () => {
    const userData = db.UserFactory.new().make()
    const captchaToken = await createChallengeToken()

    const response = await registerRequest({
      email: userData.email,
      username: userData.username,
      password: db.UserFactory.password,
      captchaToken,
    })

    const body = response._data

    expect(response.status).toBe(200)
    expect(typeof body.user.id).toBe('number')
    expect(body.user.email).toBe(userData.email)
    expect(body.user.username).toBe(userData.username)

    await destroyUser(body.user.id)
  })

  it('should return both access and refresh tokens upon registration', async () => {
    const userData = db.UserFactory.new().make()
    const captchaToken = await createChallengeToken()

    const response = await registerRequest({
      email: userData.email,
      username: userData.username,
      password: db.UserFactory.password,
      captchaToken,
    })

    const body = response._data

    expect(response.status).toBe(200)
    expect(typeof body.access_token).toBe('string')
    expect(typeof body.refresh_token).toBe('string')

    await destroyUser(body.user.id)
  })

  it('should set refresh token in HTTP-only cookie upon registration', async () => {
    const userData = db.UserFactory.new().make()
    const captchaToken = await createChallengeToken()

    const response = await registerRequest({
      email: userData.email,
      username: userData.username,
      password: db.UserFactory.password,
      captchaToken,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).match(
      new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=`),
    )

    const body = response._data

    await destroyUser(body.user.id)
  })

  it.runIf(CAPTCHA_ENABLED)('should return 400 when captcha token invalid', async () => {
    const userData = db.UserFactory.new().make()
    const captchaToken = createChallengeInvalidToken()

    const response = await registerRequest({
      email: userData.email,
      username: userData.username,
      password: db.UserFactory.password,
      captchaToken,
    })

    expect(response.status).toBe(400)
    expect(response._data.data.code).toBe('INVALID_CHALLENGE_SOLUTION')
  })

  describe('valid email formats', () => {
    it.each([
      'email@example.com',
      'firstname.lastname@example.com',
      'email@subdomain.example.com',
      'firstname+lastname@example.com',
    ])('should accept valid email format: "%s"', async (email) => {
      const userData = db.UserFactory.new().make()
      const captchaToken = await createChallengeToken()

      const response = await registerRequest({
        password: db.UserFactory.password,
        username: userData.username,
        email,
        captchaToken,
      })

      const body = response._data

      expect(response.status).toBe(200)

      await destroyUser(body.user.id)
    })
  })

  describe('valid username formats', () => {
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
    ])('should accept valid username format: "%s"', async (username) => {
      const userData = db.UserFactory.new().make()
      const captchaToken = await createChallengeToken()

      const response = await registerRequest({
        password: db.UserFactory.password,
        email: userData.email,
        username,
        captchaToken,
      })

      const body = response._data

      expect(response.status).toBe(200)

      await destroyUser(body.user.id)
    })
  })

  describe('duplicate field validation', () => {
    it('should return 422 when email is already taken', async () => {
      const userData = db.UserFactory.new().make()
      const userCreated = await db.UserFactory.new().create()
      const captchaToken = await createChallengeToken()

      const response = await registerRequest({
        email: userCreated.email,
        username: userData.username,
        password: userData.password,
        captchaToken,
      })

      expect(response.status).toBe(422)
      expect(response._data.data.code).toBe('VALIDATION_ERROR')

      await destroyUser(userCreated.id)
    })

    it('should return 422 when username is already taken', async () => {
      const userData = db.UserFactory.new().make()
      const userCreated = await db.UserFactory.new().create()
      const captchaToken = await createChallengeToken()

      const response = await registerRequest({
        email: userData.email,
        username: userCreated.username,
        password: userData.password,
        captchaToken,
      })

      expect(response.status).toBe(422)
      expect(response._data.data.code).toBe('VALIDATION_ERROR')

      await destroyUser(userCreated.id)
    })
  })

  describe('invalid email format validation', () => {
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
    ])('should return 422 for invalid email format: "%s"', async (email) => {
      const userData = db.UserFactory.new().make()
      const captchaToken = await createChallengeToken()

      const response = await registerRequest({
        username: userData.username,
        password: userData.password,
        email: email as string,
        captchaToken,
      })

      expect(response.status).toBe(422)
      expect(response._data.data.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('invalid username format validation', () => {
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
    ])('should return 422 for invalid username format: "%s"', async (username) => {
      const userData = db.UserFactory.new().make()
      const captchaToken = await createChallengeToken()

      const response = await registerRequest({
        email: userData.email,
        password: userData.password,
        username: username as string,
        captchaToken,
      })

      expect(response.status).toBe(422)
      expect(response._data.data.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('invalid password format validation', () => {
    it.each([
      undefined,
      '',
      ' ',
      '  ',
      'a'.repeat(65),
    ])('should return 422 for invalid password: "%s"', async (password) => {
      const userData = db.UserFactory.new().make()
      const captchaToken = await createChallengeToken()

      const response = await registerRequest({
        email: userData.email,
        username: userData.username,
        password: password as string,
        captchaToken,
      })

      expect(response.status).toBe(422)
      expect(response._data.data.code).toBe('VALIDATION_ERROR')
    })
  })
})
