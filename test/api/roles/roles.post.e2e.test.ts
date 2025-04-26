import type { Role } from '~/server/database'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~/server/constants'
import { createUser } from '~/test/utils/creations/create-user'
import { createRoleRequest } from '../../utils/requests/roles'

describe('create role', async () => {
  await setup()

  it('should create role', async () => {
    const name = 'new_role'
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CREATE_ROLE],
    })

    const response = await createRoleRequest({
      name,
      displayName: 'New role',
      description: 'It is a new role',
    }, {
      accessToken: data.access_token,
    })

    const role: Role = await response.json()

    expect(response.status).toBe(200)
    expect(role && role.name).toBe(name)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return error if role already exists', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CREATE_ROLE],
      })

      const response = await createRoleRequest({
        name: data.role.name,
        displayName: 'New role',
        description: 'It is a new role',
      }, {
        accessToken: data.access_token,
      })

      expect(response.status).toBe(409)

      await data.clear()
    })

    it('should return error if user have not permission', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await createRoleRequest({
        name: 'new_role',
        displayName: 'New role',
        description: 'It is a new role',
      }, {
        accessToken: data.access_token,
      })

      expect(response.status).toBe(403)

      await data.clear()
    })
  })
})
