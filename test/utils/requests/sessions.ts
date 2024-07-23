import { fetch } from '@nuxt/test-utils/e2e'

export async function getSessionsRequest(
  options: { uid: number, accessToken: string },
) {
  return await fetch(`/api/user/${options.uid}/sessions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function deleteSessionsRequest(
  options: { uid: number, uuids: string[], accessToken: string },
) {
  return await fetch(`/api/user/${options.uid}/sessions`, {
    method: 'DELETE',
    body: JSON.stringify({ uuids: options.uuids }),
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}
