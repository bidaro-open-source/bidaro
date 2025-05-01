export function createProfileApi(fetch: typeof $fetch) {
  return {
    async fetchProfile() {
      return fetch('/api/profile', { method: 'GET' })
    },
  }
}
