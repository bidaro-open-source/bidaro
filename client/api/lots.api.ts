import type { UpdateLotRequest } from '~~/server/requests/lots/lots.patch.request'
import type { CreateLotRequest } from '~~/server/requests/lots/lots.post.request'
import type { LotRequest } from '~~/server/requests/lots/lots.request'

export function createLotsApi(fetch: typeof $fetch) {
  return {
    async fetchLot(payload: LotRequest) {
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
    async deleteLot(payload: LotRequest) {
      return fetch(`/api/lots/${payload.params.id}`, {
        method: 'DELETE',
      })
    },
    async publishLot(payload: LotRequest) {
      return fetch(`/api/lots/${payload.params.id}/publish`, {
        method: 'POST',
      })
    },
    async shipLot(payload: LotRequest) {
      return fetch(`/api/lots/${payload.params.id}/ship`, {
        method: 'POST',
      })
    },
  }
}
