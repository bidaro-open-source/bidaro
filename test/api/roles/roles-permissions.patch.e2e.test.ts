import type { Permission } from '~/server/database'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~/server/constants'
import { createUser } from '~/test/utils/creations/create-user'
import { updateRolePermissionRequest } from '../../utils/requests/roles'

describe('update role permissions', async () => {
  await setup()

  it('should update role permissions', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.ASSIGN_PERMISSION],
    })

    const role = await db.RoleFactory.new().create()
    const rolePermissions = [
      permissions.CREATE_ROLE,
      permissions.VIEW_ALL_ROLES,
    ]

    const response = await updateRolePermissionRequest({
      permissions: rolePermissions,
    }, {
      name: role.name,
    }, {
      accessToken: data.access_token,
    })

    const updatedRole = await response.json()

    expect(response.status).toBe(200)

    const updatedRoleNames = updatedRole
      .map((permission: Permission) => permission.name)

    expect(updatedRoleNames).toEqual(rolePermissions)

    await role.destroy()
    await data.clear()
  })

  describe('error handling', () => {
    it('should return error if user have not permission', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const role = await db.RoleFactory.new().create()

      const response = await updateRolePermissionRequest({
        permissions: [permissions.CREATE_ROLE],
      }, {
        name: role.name,
      }, {
        accessToken: data.access_token,
      })

      expect(response.status).toBe(403)

      await role.destroy()
      await data.clear()
    })
  })
})
