import type {
  EmailVerifyConfirmRequest,
} from '~~/server/requests/profile/verification/confrim.request'

export function createProfileVerificationApi(fetch: typeof $fetch) {
  return {
    async sendVerificationRequest() {
      return fetch('/api/profile/verification', {
        method: 'POST',
      })
    },
    async confrimVerificationRequest(payload: EmailVerifyConfirmRequest) {
      return fetch('/api/profile/verification/confirm', {
        method: 'POST',
        body: payload.body,
      })
    },
  }
}
