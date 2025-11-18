import type { ConfirmPasswordRequest } from './confirm/index.request'
import type { ResetPasswordRequest } from './index.request'
import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import {
  REDIS_PASSWORD_RESET_NAMESPACE,
} from '~~/server/services/profile-recovery'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'

async function resetPasswordRequest(
  body: ResetPasswordRequest['body'],
) {
  return await fetch('/api/profile/recovery', {
    body: JSON.stringify({
      email: body.email,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

async function confirmResetPasswordRequest(
  body: ConfirmPasswordRequest['body'],
) {
  return await fetch('/api/profile/recovery/confirm', {
    body: JSON.stringify({
      token: body.token,
      password: body.password,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('POST /api/profile/recovery - Password Reset Flow with Token Validation', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should complete password reset flow successfully', async () => {
    const data = await createUser()

    const user = await db.User.findByPk(data.user.id)

    const resetResponse = await resetPasswordRequest({
      email: data.user.email,
    })

    expect(resetResponse.status).toBe(204)

    const keys = await redis.keys(`${REDIS_PASSWORD_RESET_NAMESPACE}:*`)
    const token = keys[0].replace(`${REDIS_PASSWORD_RESET_NAMESPACE}:`, '')

    const confirmResponse = await confirmResetPasswordRequest({
      password: db.UserFactory.newPassword,
      token,
    })

    expect(confirmResponse.status).toBe(204)

    const updatedUser = await db.User.findByPk(data.user.id)

    expect(user!.password).not.toBe(updatedUser!.password)

    await redis.del(`${REDIS_PASSWORD_RESET_NAMESPACE}:${token}`)
    await data.clear()
  })

  describe('error handling', () => {
    it('should return 404 when email does not exist', async () => {
      const userData = db.UserFactory.new().make()

      const response = await resetPasswordRequest({
        email: userData.email,
      })

      expect(response.status).toBe(404)
    })

    it('should return 404 when reset token does not exist', async () => {
      const response = await confirmResetPasswordRequest({
        password: db.UserFactory.newPassword,
        token: 'fff',
      })

      expect(response.status).toBe(404)
    })

    it('should return 404 when account is deleted after token generation', async () => {
      const data = await createUser()

      const response = await resetPasswordRequest({
        email: data.user.email,
      })

      expect(response.status).toBe(204)

      await data.clear()

      const keys = await redis.keys(`${REDIS_PASSWORD_RESET_NAMESPACE}:*`)
      const token = keys[0].replace(`${REDIS_PASSWORD_RESET_NAMESPACE}:`, '')

      const confirmResponse = await confirmResetPasswordRequest({
        password: db.UserFactory.newPassword,
        token,
      })

      expect(confirmResponse.status).toBe(404)

      await redis.del(`${REDIS_PASSWORD_RESET_NAMESPACE}:${token}`)
    })
  })
})
