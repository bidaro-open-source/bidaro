import { fetch } from '@nuxt/test-utils/e2e'

export async function getSessionsRequest(
  options: { accessToken: string },
) {
  return await fetch(`/api/profile/sessions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function deleteSessionsRequest(
  options: { uuids: string[], accessToken: string },
) {
  return await fetch(`/api/profile/sessions`, {
    method: 'DELETE',
    body: JSON.stringify({ uuids: options.uuids }),
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}
