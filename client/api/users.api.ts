import type { GetUserRequest } from '~~/server/requests/user.request'

export function createUsersApi(fetch: typeof $fetch) {
  return {
    async fetchUserLots(payload: GetUserRequest) {
      return fetch(`/api/users/${payload.params.id}/lots`, {
        method: 'GET',
      })
    },
  }
}
