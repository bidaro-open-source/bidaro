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
  options: { name: string, accessToken: string },
) {
  return await fetch(`/api/permissions/${options.name}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getPermissionRolesRequest(
  options: { name: string, accessToken: string },
) {
  return await fetch(`/api/permissions/${options.name}/roles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}
