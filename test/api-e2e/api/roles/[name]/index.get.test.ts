import type { ViewRoleRequest } from '../../../../../server/api/roles/[name]/index.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewRoleRequest(
  payload: ViewRoleRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/roles/${payload.params.name}`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/roles/:name', async () => {
  it('should return role with permissions', async () => {
    const roleData = await db.RoleFactory.new().create()
    await roleData.addPermissions([permissions.VIEW_PERMISSIONS])

    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_ROLES],
    })

    const response = await viewRoleRequest(
      { params: { name: roleData.name } },
      { accessToken: userData.access_token },
    )

    expect(response.status).toBe(200)
    expect(response._data.name).toBe(roleData.name)
    expect(response._data.displayName).toBe(roleData.displayName)
    expect(response._data.description).toBe(roleData.description)

    await roleData.destroy()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when role does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.VIEW_ROLES],
      })

      const response = await viewRoleRequest(
        { params: { name: 'nonexistent' } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)
      expect(response._data.data.code).toBe('ROLE_NOT_FOUND')

      await userData.clear()
    })

    it('should return 401 when user is not authenticated', async () => {
      const response = await viewRoleRequest({ params: { name: 'test' } })

      expect(response.status).toBe(401)
      expect(response._data.data.code).toBe('AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const roleData = await db.RoleFactory.new().create()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await viewRoleRequest(
        { params: { name: roleData.name } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.data.code).toBe('FORBIDDEN')

      await roleData.destroy()
      await userData.clear()
    })
  })
})
