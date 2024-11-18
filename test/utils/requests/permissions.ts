import { fetch } from '@nuxt/test-utils/e2e'

export async function getPermissionsRequest(
  options: { accessToken: string },
) {
  return await fetch(`/api/permissions/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getPermissionRequest(
  options: { id: number, accessToken: string },
) {
  return await fetch(`/api/permissions/${options.id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getPermissionRolesRequest(
  options: { id: number, accessToken: string },
) {
  return await fetch(`/api/permissions/${options.id}/roles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}
