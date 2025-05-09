import type { UpdateProfileRequest } from '~~/server/requests/profile/profile'

export function createProfileApi(fetch: typeof $fetch) {
  return {
    async fetchProfile() {
      return fetch('/api/profile', { method: 'GET' })
    },
    async updateProfile(payload: UpdateProfileRequest) {
      return fetch('/api/profile', { method: 'PATCH', body: payload.body })
    },
  }
}
