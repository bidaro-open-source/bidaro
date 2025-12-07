import type { UpdateRoleRequest } from '../../../../../server/api/roles/[name]/index.patch.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function updateRoleRequest(
  payload: UpdateRoleRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/roles/${payload.params.name}`, {
    method: 'PATCH',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PATCH /api/roles/:name', async () => {
  it('should update role displayName and description', async () => {
    const roleData = await db.RoleFactory.new().create()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_ROLE],
    })

    const newDisplayName = 'Updated Display Name'
    const newDescription = 'Updated description'

    const response = await updateRoleRequest(
      {
        params: { name: roleData.name },
        body: { displayName: newDisplayName, description: newDescription },
      },
      { accessToken: userData.access_token },
    )

    expect(response.status).toBe(200)
    expect(response._data.displayName).toBe(newDisplayName)
    expect(response._data.description).toBe(newDescription)

    await roleData.destroy()
    await userData.clear()
  })

  it('should update only displayName', async () => {
    const roleData = await db.RoleFactory.new().create()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_ROLE],
    })

    const newDisplayName = 'Updated Display Name'

    const response = await updateRoleRequest(
      {
        params: { name: roleData.name },
        body: { displayName: newDisplayName },
      },
      { accessToken: userData.access_token },
    )

    expect(response.status).toBe(200)
    expect(response._data.displayName).toBe(newDisplayName)
    expect(response._data.description).toBe(roleData.description)

    await roleData.destroy()
    await userData.clear()
  })

  it('should update only description', async () => {
    const roleData = await db.RoleFactory.new().create()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_ROLE],
    })

    const newDescription = 'Updated description'

    const response = await updateRoleRequest(
      {
        params: { name: roleData.name },
        body: { description: newDescription },
      },
      { accessToken: userData.access_token },
    )

    expect(response.status).toBe(200)
    expect(response._data.displayName).toBe(roleData.displayName)
    expect(response._data.description).toBe(newDescription)

    await roleData.destroy()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when role does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_ROLE],
      })

      const response = await updateRoleRequest(
        { params: { name: 'nonexistent' }, body: { displayName: 'Test' } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)
      expect(response._data.code).toBe('NOT_FOUND')

      await userData.clear()
    })

    it('should return 401 when user is not authenticated', async () => {
      const roleData = await db.RoleFactory.new().create()
      const response = await updateRoleRequest(
        { params: { name: roleData.name }, body: { displayName: 'Test' } },
      )

      expect(response.status).toBe(401)
      expect(response._data.code).toBe('AUTHENTICATION_REQUIRED')

      await roleData.destroy()
    })

    it('should return 403 when user lacks required permission', async () => {
      const roleData = await db.RoleFactory.new().create()

      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await updateRoleRequest(
        {
          params: { name: roleData.name },
          body: { displayName: 'Test' },
        },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.code).toBe('FORBIDDEN')

      await roleData.destroy()
      await userData.clear()
    })
  })
})
