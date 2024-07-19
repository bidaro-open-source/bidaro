import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import type {
  RequestBody as ConfirmRequestBody,
} from '~/server/requests/auth/reset-password/confirm.post'
import type {
  RequestBody,
} from '~/server/requests/auth/reset-password/index.post'
import {
  REDIS_PASSWORD_RESET_NAMESPACE,
} from '~/server/services/password-reset'

async function makeResetPasswordRequest(body: RequestBody) {
  return await fetch('/api/auth/reset-password', {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

async function makeConfirmResetPasswordRequest(body: ConfirmRequestBody) {
  return await fetch('/api/auth/reset-password/confirm', {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('reset password', async () => {
  await setup()

  it('should reset password', async () => {
    const user = await db.UserFactory.new().create()

    const response = await makeResetPasswordRequest({
      email: user.email,
    })

    const body = await response.json()

    expect(body.ok).toBeTruthy()

    const keys = await redis.keys(`${REDIS_PASSWORD_RESET_NAMESPACE}:*`)
    const token = keys[0].replace(`${REDIS_PASSWORD_RESET_NAMESPACE}:`, '')

    const confirmResponse = await makeConfirmResetPasswordRequest({
      password: db.UserFactory.newPassword,
      token,
    })

    const confirmBody = await confirmResponse.json()

    expect(confirmBody.ok).toBeTruthy()

    const updatedUser = await db.User.findByPk(user.id)

    expect(user.password).not.toBe(updatedUser!.password)

    await redis.del(`${REDIS_PASSWORD_RESET_NAMESPACE}:${token}`)
    await updatedUser!.destroy()
  })

  describe('error handling', () => {
    it('should return error if email not found', async () => {
      const userData = db.UserFactory.new().make()

      const response = await makeResetPasswordRequest({
        email: userData.email,
      })

      expect(response.status).toBe(404)
    })

    it('should return error if token not found', async () => {
      const response = await makeConfirmResetPasswordRequest({
        token: '936acb91-9837-4d4c-a6ec-a6d02a72eb52',
        password: db.UserFactory.newPassword,
      })

      expect(response.status).toBe(404)
    })

    it('should return error if account not found', async () => {
      const user = await db.UserFactory.new().create()

      const response = await makeResetPasswordRequest({
        email: user.email,
      })

      const body = await response.json()

      expect(body.ok).toBeTruthy()

      await user.destroy()

      const keys = await redis.keys(`${REDIS_PASSWORD_RESET_NAMESPACE}:*`)
      const token = keys[0].replace(`${REDIS_PASSWORD_RESET_NAMESPACE}:`, '')

      const confirmResponse = await makeConfirmResetPasswordRequest({
        token,
        password: db.UserFactory.newPassword,
      })

      expect(confirmResponse.status).toBe(404)

      await redis.del(`${REDIS_PASSWORD_RESET_NAMESPACE}:${token}`)
    })
  })
})
