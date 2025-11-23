import type { UpdateUserRoleRequest } from './index.put.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions, roles } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function updateUserRoleRequest(
  payload: UpdateUserRoleRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}/role`, {
    method: 'PUT',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PUT /api/users/:id/role', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should update user role successfully', async () => {
    const userData = await createUser()
    const roleData = await db.RoleFactory.new().create()
    const adminData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_USER_ROLE],
    })

    const response = await updateUserRoleRequest(
      { params: { id: userData.user.id }, body: { roleName: roleData.name } },
      { accessToken: adminData.access_token },
    )

    const user = response._data

    expect(response.status).toBe(200)
    expect(user.id).toBe(userData.user.id)

    // Verify the role was updated in the database
    const updatedUser = await db.User.findByPk(userData.user.id)
    expect(updatedUser?.roleName).toBe(roleData.name)

    await userData.clear()
    await roleData.destroy()
    await adminData.clear()
  })

  it('should set user role to null successfully', async () => {
    const userData = await createUser({ withRole: true })
    const adminData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_USER_ROLE],
    })

    const response = await updateUserRoleRequest(
      { params: { id: userData.user.id }, body: { roleName: null } },
      { accessToken: adminData.access_token },
    )

    const user = response._data

    expect(response.status).toBe(200)
    expect(user.id).toBe(userData.user.id)

    // Verify the role was set to null in the database
    const updatedUser = await db.User.findByPk(userData.user.id)
    expect(updatedUser?.roleName).toBe(null)

    await userData.clear()
    await adminData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()

      const response = await updateUserRoleRequest({
        params: { id: userData.user.id },
        body: { roleName: roles.USER },
      })

      expect(response.status).toBe(401)

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser()
      const adminData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await updateUserRoleRequest(
        { params: { id: userData.user.id }, body: { roleName: roles.USER } },
        { accessToken: adminData.access_token },
      )

      expect(response.status).toBe(403)

      await userData.clear()
      await adminData.clear()
    })

    it('should return 404 when user does not exist', async () => {
      const adminData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_USER_ROLE],
      })

      const response = await updateUserRoleRequest(
        { params: { id: 93475937459 }, body: { roleName: roles.USER } },
        { accessToken: adminData.access_token },
      )

      expect(response.status).toBe(404)

      await adminData.clear()
    })
  })
})
