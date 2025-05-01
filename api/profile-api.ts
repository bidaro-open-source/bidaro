import type { DeleteSessionsRequest } from '~/server/requests/profile/sessions'

export function createProfileApi(fetch: typeof $fetch) {
  return {
    async fetchProfile() {
      return fetch('/api/profile', { method: 'GET' })
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
