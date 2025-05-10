import type {
  ConfirmPasswordRequest,
} from '~~/server/requests/profile/recovery/confirm.request'
import type {
  ResetPasswordRequest,
} from '~~/server/requests/profile/recovery/index.request'

export function createProfileRecoveryApi(fetch: typeof $fetch) {
  return {
    async sendRecoveryRequest(payload: ResetPasswordRequest) {
      return fetch('/api/profile/recovery', {
        method: 'POST',
        body: payload.body,
      })
    },
    async confirmRecoveryRequest(payload: ConfirmPasswordRequest) {
      return fetch('/api/profile/recovery/confirm', {
        method: 'POST',
        body: payload.body,
      })
    },
  }
}
