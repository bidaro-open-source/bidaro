import type {
  CreateLotRequest,
  DeleteLotRequest,
  GetLotRequest,
  PublishLotRequest,
  ShipLotRequest,
  UpdateLotRequest,
} from '~~/server/requests/lots/lot.request'

export function createLotsApi(fetch: typeof $fetch) {
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
    async publishLot(payload: PublishLotRequest) {
      return fetch(`/api/lots/${payload.params.id}/publish`, {
        method: 'POST',
      })
    },
    async shipLot(payload: ShipLotRequest) {
      return fetch(`/api/lots/${payload.params.id}/ship`, {
        method: 'POST',
      })
    },
  }
}
