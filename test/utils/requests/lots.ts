import type { CreateLotBetRequest } from '~~/server/requests/lots/bets.post.request'
import type { UpdateLotRequest } from '~~/server/requests/lots/lots.patch.request'
import type { CreateLotRequest } from '~~/server/requests/lots/lots.post.request'
import type { LotRequest } from '~~/server/requests/lots/lots.request'
import { fetch } from '@nuxt/test-utils/e2e'

export async function getLotRequest(
  payload: LotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(
        options.accessToken
          ? { Authorization: `Bearer ${options.accessToken}` }
          : {}
      ),
    },
  })
}

export async function createLotRequest(
  payload: CreateLotRequest,
  options: { accessToken: string },
) {
  return await fetch(`/api/lots`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload.body),
  })
}

export async function createDraftLotRequest(
  payload: CreateLotRequest,
  options: { accessToken: string },
) {
  return await fetch(`/api/lots/draft`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload.body),
  })
}

export async function updateLotRequest(
  payload: UpdateLotRequest,
  options: { accessToken: string },
) {
  return await fetch(`/api/lots/${payload.params.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload.body),
  })
}

export async function deleteLotRequest(
  payload: LotRequest,
  options: { accessToken: string },
) {
  return await fetch(`/api/lots/${payload.params.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getLotBetsRequest(
  payload: LotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/bets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(
        options.accessToken
          ? { Authorization: `Bearer ${options.accessToken}` }
          : {}
      ),
    },
  })
}

export async function createLotBetRequest(
  payload: CreateLotBetRequest,
  options: { accessToken: string },
) {
  return await fetch(`/api/lots/${payload.params.id}/bets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload.body),
  })
}

export async function publishLotRequest(
  payload: LotRequest,
  options: { accessToken: string },
) {
  return await fetch(`/api/lots/${payload.params.id}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function shipLotRequest(
  payload: LotRequest,
  options: { accessToken: string },
) {
  return await fetch(`/api/lots/${payload.params.id}/ship`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}
