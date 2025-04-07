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
  options: { name: string, accessToken: string },
) {
  return await fetch(`/api/roles/${options.name}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getRolePermissionsRequest(
  options: { name: string, accessToken: string },
) {
  return await fetch(`/api/roles/${options.name}/permissions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}
