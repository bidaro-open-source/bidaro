import type { GetUserRequest } from '~~/server/requests/user.request'
import { fetch } from '@nuxt/test-utils/e2e'

export async function getUserRequest(
  payload: GetUserRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}`, {
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

export async function getUserLotsRequest(
  payload: GetUserRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}/lots`, {
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

export async function getUserBetsRequest(
  payload: GetUserRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}/bets`, {
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
