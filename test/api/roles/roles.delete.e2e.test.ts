import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions, roles } from '~/server/constants'
import { createUser } from '~/test/utils/creations/create-user'
import { deleteRoleRequest } from '../../utils/requests/roles'

describe('delete role', async () => {
  await setup()

  it('should delete role', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_ROLE],
    })

    const role = await db.RoleFactory.new().create()

    const response = await deleteRoleRequest({}, {
      name: role.name,
    }, {
      accessToken: data.access_token,
    })

    expect(response.status).toBe(200)

    await role.destroy()
    await data.clear()
  })

  it('should delete role with replace', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_ROLE],
    })

    const role1 = await db.RoleFactory.new().create()
    const role2 = await db.RoleFactory.new().create()

    const user = await db.UserFactory.new().create({
      roleName: role1.name,
    })

    const response = await deleteRoleRequest({
      replace: role2.name,
    }, {
      name: role1.name,
    }, {
      accessToken: data.access_token,
    })

    expect(response.status).toBe(200)

    await user.reload()

    expect(user.roleName).toBe(role2.name)

    await user.destroy()
    await role2.destroy()
    await data.clear()
  })

  describe('error handling', () => {
    it('should return error if role not exists', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_ROLE],
      })

      const response = await deleteRoleRequest({}, {
        name: 'not_exists_role',
      }, {
        accessToken: data.access_token,
      })

      expect(response.status).toBe(404)

      await data.clear()
    })

    it('should return error if delete reserved role', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_ROLE],
      })

      const response = await deleteRoleRequest({}, {
        name: roles.USER,
      }, {
        accessToken: data.access_token,
      })

      expect(response.status).toBe(403)

      await data.clear()
    })

    it('should return error if user have not permission', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const role = await db.RoleFactory.new().create()

      const response = await deleteRoleRequest({}, {
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
