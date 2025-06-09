import type {
  CreateLotRequest,
  DeleteLotRequest,
  GetLotRequest,
  UpdateLotRequest,
} from '~~/server/requests/lots/lot.request'

export function createLotApi(fetch: typeof $fetch) {
  return {
    async fetchLot(payload: GetLotRequest) {
      return fetch(`/api/lots/${payload.params.id}`, {
        method: 'GET',
      })
    },
    async createLot(payload: CreateLotRequest) {
      return fetch('/api/lots', {
        method: 'POST',
        body: payload.body,
      })
    },
    async updateLot(payload: UpdateLotRequest) {
      return fetch(`/api/lots/${payload.params.id}`, {
        method: 'PATCH',
        body: payload.body,
      })
    },
    async deleteLot(payload: DeleteLotRequest) {
      return fetch(`/api/lots/${payload.params.id}`, {
        method: 'DELETE',
      })
    },
  }
}
