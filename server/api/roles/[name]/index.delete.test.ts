import type { GetRoleRequest } from './index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions, roles } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function deleteRoleRequest(
  payload: GetRoleRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/roles/${payload.params.name}`, {
    method: 'DELETE',
    accessToken: options.accessToken,
  })
}

describe('DELETE /api/roles/:name', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should delete role successfully', async () => {
    const roleData = await db.RoleFactory.new().create()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_ROLE],
    })

    const response = await deleteRoleRequest({ params: { name: roleData.name } }, { accessToken: userData.access_token })

    expect(response.status).toBe(204)

    const deletedRole = await db.Role.findByPk(roleData.name)
    expect(deletedRole).toBe(null)

    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when role does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_ROLE],
      })

      const response = await deleteRoleRequest({ params: { name: 'nonexistent' } }, { accessToken: userData.access_token })

      expect(response.status).toBe(404)

      await userData.clear()
    })

    it('should return 400 when trying to delete reserved role', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_ROLE],
      })

      const response = await deleteRoleRequest({ params: { name: roles.USER } }, { accessToken: userData.access_token })

      expect(response.status).toBe(400)

      await userData.clear()
    })

    it('should return 400 when role contains users', async () => {
      const roleData = await db.RoleFactory.new().create()
      const userWithRole = await db.UserFactory.new().create({ roleName: roleData.name })

      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_ROLE],
      })

      const response = await deleteRoleRequest({ params: { name: roleData.name } }, { accessToken: userData.access_token })

      expect(response.status).toBe(400)

      await userWithRole.destroy()
      await roleData.destroy()
      await userData.clear()
    })

    it('should return 401 when user is not authenticated', async () => {
      const response = await deleteRoleRequest({ params: { name: 'test' } })

      expect(response.status).toBe(401)
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await deleteRoleRequest({ params: { name: 'test' } }, { accessToken: userData.access_token })

      expect(response.status).toBe(403)

      await userData.clear()
    })
  })
})
