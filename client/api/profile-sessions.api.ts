import type { DeleteSessionsRequest } from '~~/server/requests/profile/sessions.request'

export function createProfileSessionsApi(fetch: typeof $fetch) {
  return {
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
