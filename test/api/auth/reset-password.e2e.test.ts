import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import {
  REDIS_PASSWORD_RESET_NAMESPACE,
} from '~/server/services/password-reset'
import { destroyUser, registerUser } from '~/test/utils/requests/authentication'
import {
  confirmResetPasswordRequest,
  resetPasswordRequest,
} from '~/test/utils/requests/reset-password'

describe('reset password', async () => {
  await setup()

  it('should reset password', async () => {
    const data = await registerUser()

    const user = await db.User.findByPk(data.user.id)

    const resetResponse = await resetPasswordRequest({
      email: data.user.email,
    })

    expect(resetResponse.status).toBe(200)

    const keys = await redis.keys(`${REDIS_PASSWORD_RESET_NAMESPACE}:*`)
    const token = keys[0].replace(`${REDIS_PASSWORD_RESET_NAMESPACE}:`, '')

    const confirmResponse = await confirmResetPasswordRequest({
      password: db.UserFactory.newPassword,
      token,
    })

    expect(confirmResponse.status).toBe(200)

    const updatedUser = await db.User.findByPk(data.user.id)

    expect(user!.password).not.toBe(updatedUser!.password)

    await redis.del(`${REDIS_PASSWORD_RESET_NAMESPACE}:${token}`)
    await destroyUser(data.user.id)
  })

  describe('error handling', () => {
    it('should return error if email not found', async () => {
      const userData = db.UserFactory.new().make()

      const response = await resetPasswordRequest({
        email: userData.email,
      })

      expect(response.status).toBe(404)
    })

    it('should return error if token not found', async () => {
      const response = await confirmResetPasswordRequest({
        password: db.UserFactory.newPassword,
        token: 'fff',
      })

      expect(response.status).toBe(404)
    })

    it('should return error if account not found', async () => {
      const data = await registerUser()

      const response = await resetPasswordRequest({
        email: data.user.email,
      })

      expect(response.status).toBe(200)

      await destroyUser(data.user.id)

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
