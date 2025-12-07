import type { ConfirmPasswordRequest } from '../../../../server/api/profile/recovery/confirm/index.request'
import type { ResetPasswordRequest } from '../../../../server/api/profile/recovery/index.request'
import { env } from 'node:process'
import { describe, expect, it } from 'vitest'
import { createChallengeInvalidToken } from '~~/test/api-e2e/arrangers/challenge/create-challenge-invalid-token'
import { createChallengeToken } from '~~/test/api-e2e/arrangers/challenge/create-challenge-token'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

const CAPTCHA_ENABLED = env.NUXT_CHALLENGE_ENABLED === 'true'

async function resetPasswordRequest(payload: ResetPasswordRequest) {
  return await fetch('/api/profile/recovery', {
    body: payload.body,
    method: 'POST',
  })
}

async function confirmResetPasswordRequest(payload: ConfirmPasswordRequest) {
  return await fetch('/api/profile/recovery/confirm', {
    body: payload.body,
    method: 'POST',
  })
}

describe('POST /api/profile/recovery', async () => {
  it('should complete password reset flow successfully', async () => {
    const data = await createUser()
    const captchaToken = await createChallengeToken()

    const user = await db.User.findByPk(data.user.id)

    const resetResponse = await resetPasswordRequest(
      { body: { email: data.user.email, captchaToken } },
    )

    expect(resetResponse.status).toBe(204)

    const messages = await mailhog.getMessagesByEmail(data.user.email)
    const content = messages[0].Content.Body.replace(/=[\r\n]+/g, '')
    const regex = /\/profile\/recovery\/([a-fA-F0-9]+)/
    const match = content.match(regex)
    const token = match ? match[1] : null

    expect(token).toBeDefined()

    const confirmResponse = await confirmResetPasswordRequest(
      { body: { password: db.UserFactory.newPassword, token } },
    )

    expect(confirmResponse.status).toBe(204)

    const updatedUser = await db.User.findByPk(data.user.id)

    expect(user!.password).not.toBe(updatedUser!.password)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 404 when email does not exist', async () => {
      const userData = db.UserFactory.new().make()
      const captchaToken = await createChallengeToken()

      const response = await resetPasswordRequest(
        { body: { email: userData.email, captchaToken } },
      )

      expect(response.status).toBe(404)
      expect(response._data.code).toBe('RECOVERY_TOKEN_NOT_FOUND')
    })

    it('should return 404 when reset token does not exist', async () => {
      const response = await confirmResetPasswordRequest(
        { body: { password: db.UserFactory.newPassword, token: 'fff' } },
      )

      expect(response.status).toBe(404)
      expect(response._data.code).toBe('RECOVERY_TOKEN_NOT_FOUND')
    })

    it('should return 404 when account is deleted after token generation', async () => {
      const data = await createUser()
      const captchaToken = await createChallengeToken()

      const response = await resetPasswordRequest(
        { body: { email: data.user.email, captchaToken } },
      )

      expect(response.status).toBe(204)

      await data.clear()

      const messages = await mailhog.getMessagesByEmail(data.user.email)
      const content = messages[0].Content.Body.replace(/=[\r\n]+/g, '')
      const regex = /\/profile\/recovery\/([a-fA-F0-9]+)/
      const match = content.match(regex)
      const token = match ? match[1] : null

      expect(token).toBeDefined()

      const confirmResponse = await confirmResetPasswordRequest(
        { body: { password: db.UserFactory.newPassword, token } },
      )

      expect(confirmResponse.status).toBe(404)
      expect(confirmResponse._data.code).toBe('RECOVERY_TOKEN_NOT_FOUND')
    })

    it.runIf(CAPTCHA_ENABLED)('should return 400 when captcha token is invalid', async () => {
      const data = await createUser()
      const captchaToken = createChallengeInvalidToken()

      const resetResponse = await resetPasswordRequest(
        { body: { email: data.user.email, captchaToken } },
      )

      expect(resetResponse.status).toBe(400)
      expect(resetResponse._data.code).toBe('INVALID_CHALLENGE_SOLUTION')

      await data.clear()
    })
  })
})
