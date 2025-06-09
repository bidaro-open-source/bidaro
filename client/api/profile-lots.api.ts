export function createProfileLotsApi(fetch: typeof $fetch) {
  return {
    async fetchLots() {
      return fetch('/api/profile/lots', {
        method: 'GET',
      })
    },
  }
}
