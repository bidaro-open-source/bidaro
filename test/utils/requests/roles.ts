import { fetch } from '@nuxt/test-utils/e2e'

export async function getRolesRequest(
  options: { accessToken: string },
) {
  return await fetch(`/api/roles/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getRoleRequest(
  options: { id: number, accessToken: string },
) {
  return await fetch(`/api/roles/${options.id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getRolePermissionsRequest(
  options: { id: number, accessToken: string },
) {
  return await fetch(`/api/roles/${options.id}/permissions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}
