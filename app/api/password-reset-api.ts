import type {
  ConfirmPasswordRequest,
} from '~~/server/requests/auth/reset-password/confirm.post'
import type {
  ResetPasswordRequest,
} from '~~/server/requests/auth/reset-password/index.post'

export function createPasswordResetApi(fetch: typeof $fetch) {
  return {
    async sendConfirmRequest(payload: ResetPasswordRequest) {
      return fetch('/api/auth/reset-password', {
        method: 'POST',
        body: payload.body,
      })
    },
    async sendNewPassword(payload: ConfirmPasswordRequest) {
      return fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        body: payload.body,
      })
    },
  }
}
