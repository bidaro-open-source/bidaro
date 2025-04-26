import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~/server/constants'
import { createUser } from '~/test/utils/creations/create-user'
import { updateRoleRequest } from '../../utils/requests/roles'

describe('update role', async () => {
  await setup()

  it('should update role', async () => {
    const newDisplayName = 'New role'
    const newDescription = 'It is a new role'
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_ROLE],
    })

    const role = await db.RoleFactory.new().create()

    const response = await updateRoleRequest({
      displayName: newDisplayName,
      description: newDescription,
    }, {
      name: role.name,
    }, {
      accessToken: data.access_token,
    })

    const responseJson = await response.json()

    expect(response.status).toBe(200)
    expect(responseJson.name).toBe(role.name)
    expect(responseJson.displayName).toBe(newDisplayName)
    expect(responseJson.description).toBe(newDescription)

    await role.destroy()
    await data.clear()
  })

  describe('error handling', () => {
    it('should return error if role not exists', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_ROLE],
      })

      const response = await updateRoleRequest({
        displayName: 'New display name',
      }, {
        name: 'not_exists_role',
      }, {
        accessToken: data.access_token,
      })

      expect(response.status).toBe(404)

      await data.clear()
    })

    it('should return error if user have not permission', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const role = await db.RoleFactory.new().create()

      const response = await updateRoleRequest({
        displayName: 'New display name',
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
