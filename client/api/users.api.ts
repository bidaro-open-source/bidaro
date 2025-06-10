import type {
  GetUserLotsRequest,
} from '~~/server/requests/users/user-lots.request'

export function createUsersApi(fetch: typeof $fetch) {
  return {
    async fetchUserLots(payload: GetUserLotsRequest) {
      return fetch(`/api/users/${payload.params.id}/lots`, {
        method: 'GET',
      })
    },
  }
}
