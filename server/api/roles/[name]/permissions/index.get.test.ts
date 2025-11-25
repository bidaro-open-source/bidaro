import type { ViewRoleRequest } from '../index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewRolePermissionsRequest(
  payload: ViewRoleRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/roles/${payload.params.name}/permissions`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/roles/:name/permissions', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return role permissions', async () => {
    const roleData = await db.RoleFactory.new().create()
    await roleData.addPermissions([
      permissions.VIEW_PERMISSIONS,
      permissions.UPDATE_PERMISSIONS,
    ])

    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_ROLE_PERMISSIONS],
    })

    const response = await viewRolePermissionsRequest(
      { params: { name: roleData.name } },
      { accessToken: userData.access_token },
    )

    expect(response.status).toBe(200)
    expect(Array.isArray(response._data)).toBe(true)
    expect(response._data.length).toBe(2)
    expect(response._data[0]).toHaveProperty('name')
    expect(response._data[0]).toHaveProperty('displayName')
    expect(response._data[0]).toHaveProperty('description')

    await roleData.destroy()
    await userData.clear()
  })

  it('should return empty array when role has no permissions', async () => {
    const roleData = await db.RoleFactory.new().create()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_ROLE_PERMISSIONS],
    })

    const response = await viewRolePermissionsRequest(
      { params: { name: roleData.name } },
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
        withPermissions: [permissions.VIEW_ROLE_PERMISSIONS],
      })

      const response = await viewRolePermissionsRequest(
        { params: { name: 'nonexistent' } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)

      await userData.clear()
    })

    it('should return 401 when user is not authenticated', async () => {
      const roleData = await db.RoleFactory.new().create()
      const response = await viewRolePermissionsRequest(
        { params: { name: roleData.name } },
      )

      expect(response.status).toBe(401)

      await roleData.destroy()
    })

    it('should return 403 when user lacks required permission', async () => {
      const roleData = await db.RoleFactory.new().create()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await viewRolePermissionsRequest(
        { params: { name: roleData.name } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)

      await roleData.destroy()
      await userData.clear()
    })
  })
})
