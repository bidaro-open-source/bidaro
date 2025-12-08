import type { EmailVerifyConfirmRequest } from '../../../../server/api/profile/verification/confirm/index.request'
import { describe, expect, it } from 'vitest'
import { actionLimits } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function sendVerificationRequest(options: { accessToken?: string } = {}) {
  return await fetch('/api/profile/verification', {
    method: 'POST',
    accessToken: options.accessToken,
  })
}

async function confirmVerificationRequest(payload: EmailVerifyConfirmRequest) {
  return await fetch('/api/profile/verification/confirm', {
    method: 'POST',
    body: payload.body,
  })
}

describe('POST /api/profile/verification', async () => {
  it('should complete verification flow successfully', async () => {
    const data = await createUser({ withSession: true })

    const verificationResponse = await sendVerificationRequest({
      accessToken: data.access_token,
    })

    expect(verificationResponse.status).toBe(204)

    const messages = await mailhog.getMessagesByEmail(data.user.email)
    const content = messages[0].Content.Body.replace(/=[\r\n]+/g, '')
    const regex = /\/profile\/verification\/([a-fA-F0-9]+)/
    const match = content.match(regex)
    const token = match ? match[1] : null

    expect(typeof token).toBe('string')

    const confirmResponse = await confirmVerificationRequest({ body: { token } })

    expect(confirmResponse.status).toBe(204)

    await data.user.reload()

    expect(data.user.emailVerifiedAt).toBeInstanceOf(Date)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await sendVerificationRequest()

      expect(response.status).toBe(401)
      expect(response._data.data.code).toBe('AUTHENTICATION_REQUIRED')
    })

    it('should return 404 when token does not exist', async () => {
      const data = await createUser({ withSession: true })

      const response = await confirmVerificationRequest({ body: { token: 'sdlfjsldfjlsdf' } })

      expect(response.status).toBe(404)
      expect(response._data.data.code).toBe('VERIFICATION_TOKEN_NOT_FOUND')

      await data.clear()
    })

    it('should return 404 when user not exist', async () => {
      const data = await createUser({ withSession: true })

      const verificationResponse = await sendVerificationRequest({
        accessToken: data.access_token,
      })

      expect(verificationResponse.status).toBe(204)

      const messages = await mailhog.getMessagesByEmail(data.user.email)
      const content = messages[0].Content.Body.replace(/=[\r\n]+/g, '')
      const regex = /\/profile\/verification\/([a-fA-F0-9]+)/
      const match = content.match(regex)
      const token = match ? match[1] : null

      expect(typeof token).toBe('string')

      await data.clear()

      const confirmResponse = await confirmVerificationRequest({ body: { token } })

      expect(confirmResponse.status).toBe(404)
      expect(confirmResponse._data.data.code).toBe('USER_NOT_FOUND')
    })

    it('should return 429 when the user has exceeded the daily limit', async () => {
      const data = await createUser({ withSession: true })

      for (let i = 0; i < actionLimits.EMAIL_VERIFICATION_REQUEST; i++) {
        const response = await sendVerificationRequest({ accessToken: data.access_token })

        expect(response.status).toBe(204)
      }

      const response = await sendVerificationRequest({ accessToken: data.access_token })

      expect(response.status).toBe(429)

      await data.clear()
    })
  })
})
