import type { UpdateRolePermissionsRequest } from '../../../../../../server/api/roles/[name]/permissions/index.put.request'
import { describe, expect, it } from 'vitest'
import { permissions, roles } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../../utils/expect-api-error'

async function updateRolePermissionsRequest(
  payload: UpdateRolePermissionsRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/roles/${payload.params.name}/permissions`, {
    method: 'PUT',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PUT /api/roles/:name/permissions', async () => {
  it('should update role permissions', async () => {
    const roleData = await db.RoleFactory.new().create()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_ROLE_PERMISSIONS],
    })

    const permissionsToAdd = [
      permissions.VIEW_PERMISSIONS,
      permissions.UPDATE_PERMISSIONS,
    ]

    const response = await updateRolePermissionsRequest(
      {
        params: { name: roleData.name },
        body: { permissions: permissionsToAdd },
      },
      { accessToken: userData.access_token },
    )

    const responseData = Array.isArray(response._data) ? response._data : []
    const permissionNames = responseData.map((p: any) => p.name)

    expect(response.status).toBe(200)
    expect(responseData.length).toBe(2)
    expect(permissionNames).toContain(permissions.VIEW_PERMISSIONS)
    expect(permissionNames).toContain(permissions.UPDATE_PERMISSIONS)

    await roleData.destroy()
    await userData.clear()
  })

  it('should replace existing permissions', async () => {
    const roleData = await db.RoleFactory.new().create()
    await roleData.addPermissions([permissions.VIEW_PERMISSIONS])

    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_ROLE_PERMISSIONS],
    })

    const newPermissions = [permissions.UPDATE_PERMISSIONS]

    const response = await updateRolePermissionsRequest(
      {
        params: { name: roleData.name },
        body: { permissions: newPermissions },
      },
      { accessToken: userData.access_token },
    )

    const responseData = Array.isArray(response._data) ? response._data : []
    const permissionNames = responseData.map((p: any) => p.name)

    expect(response.status).toBe(200)
    expect(responseData.length).toBe(1)
    expect(permissionNames[0]).toBe(permissions.UPDATE_PERMISSIONS)

    await roleData.destroy()
    await userData.clear()
  })

  it('should clear all permissions when empty array is provided', async () => {
    const roleData = await db.RoleFactory.new().create()
    await roleData.addPermissions([permissions.VIEW_PERMISSIONS])

    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_ROLE_PERMISSIONS],
    })

    const response = await updateRolePermissionsRequest(
      { params: { name: roleData.name }, body: { permissions: [] } },
      { accessToken: userData.access_token },
    )

    expect(response.status).toBe(200)
    expect(Array.isArray(response._data)).toBe(true)
    expect(response._data.length).toBe(0)

    await roleData.destroy()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when role does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_ROLE_PERMISSIONS],
      })

      const response = await updateRolePermissionsRequest(
        {
          params: { name: 'nonexistent' },
          body: { permissions: [permissions.VIEW_PERMISSIONS] },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'ROLE_NOT_FOUND')

      await userData.clear()
    })

    it('should return 400 when trying to update reserved role permissions', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_ROLE_PERMISSIONS],
      })

      const response = await updateRolePermissionsRequest(
        {
          params: { name: roles.USER },
          body: { permissions: [permissions.VIEW_PERMISSIONS] },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'ROLE_IS_RESERVED')

      await userData.clear()
    })

    it('should return 422 when permission does not exist', async () => {
      const roleData = await db.RoleFactory.new().create()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_ROLE_PERMISSIONS],
      })

      const response = await updateRolePermissionsRequest(
        {
          params: { name: roleData.name },
          body: { permissions: ['nonexistent_permission'] },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'PERMISSIONS_NOT_FOUND')

      await roleData.destroy()
      await userData.clear()
    })

    it('should return 401 when user is not authenticated', async () => {
      const response = await updateRolePermissionsRequest(
        { params: { name: 'test' }, body: { permissions: [] } },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const roleData = await db.RoleFactory.new().create()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await updateRolePermissionsRequest(
        { params: { name: roleData.name }, body: { permissions: [] } },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await roleData.destroy()
      await userData.clear()
    })
  })
})
