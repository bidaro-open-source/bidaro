import type { UpdateProfileRequest } from '~~/server/requests/profile/profile'
import type { DeleteSessionsRequest } from '~~/server/requests/profile/sessions'
import type {
  EmailVerifyConfirmRequest,
} from '~~/server/requests/profile/verify'

export function createProfileApi(fetch: typeof $fetch) {
  return {
    async fetchProfile() {
      return fetch('/api/profile', { method: 'GET' })
    },
    async updateProfile(payload: UpdateProfileRequest) {
      return fetch('/api/profile', { method: 'PATCH', body: payload.body })
    },
    async verifyEmailProfile() {
      return fetch('/api/profile/verify', {
        method: 'POST',
      })
    },
    async verifyConfirmEmailProfile(payload: EmailVerifyConfirmRequest) {
      return fetch('/api/profile/verify/confirm', {
        method: 'POST',
        body: payload.body,
      })
    },
    async fetchSessions() {
      return fetch('/api/profile/sessions', { method: 'GET' })
    },
    async deleteSessions(payload: DeleteSessionsRequest) {
      return fetch('/api/profile/sessions', {
        method: 'DELETE',
        body: payload.body,
      })
    },
  }
}
