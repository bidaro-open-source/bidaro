import type {
  CreateRoleRequest,
  DeleteRoleRequest,
  UpdateRolePermissionRequest,
  UpdateRoleRequest,
} from '~/server/requests/roles'
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

export async function createRoleRequest(
  body: CreateRoleRequest['body'],
  options: { accessToken: string },
) {
  return await fetch(`/api/roles/`, {
    method: 'POST',
    body: JSON.stringify({
      name: body.name,
      displayName: body.displayName,
      description: body.description,
    }),
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function updateRoleRequest(
  body: UpdateRoleRequest['body'],
  params: UpdateRoleRequest['params'],
  options: { accessToken: string },
) {
  return await fetch(`/api/roles/${params.name}`, {
    method: 'PATCH',
    body: JSON.stringify({
      displayName: body.displayName,
      description: body.description,
    }),
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function deleteRoleRequest(
  body: DeleteRoleRequest['body'],
  params: DeleteRoleRequest['params'],
  options: { accessToken: string },
) {
  return await fetch(`/api/roles/${params.name}`, {
    method: 'DELETE',
    body: JSON.stringify({
      replace: body.replace,
    }),
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function updateRolePermissionRequest(
  body: UpdateRolePermissionRequest['body'],
  params: UpdateRolePermissionRequest['params'],
  options: { accessToken: string },
) {
  return await fetch(`/api/roles/${params.name}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify({
      permissions: body.permissions,
    }),
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}
