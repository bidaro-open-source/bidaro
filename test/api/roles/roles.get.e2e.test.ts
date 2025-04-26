import type { Role } from '~/server/database'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~/server/constants'
import { createUser } from '~/test/utils/creations/create-user'
import {
  getRolePermissionsRequest,
  getRoleRequest,
  getRolesRequest,
} from '../../utils/requests/roles'

describe('roles fetching', async () => {
  await setup()

  it('should return all roles', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_ALL_ROLES],
    })

    const response = await getRolesRequest({
      accessToken: data.access_token,
    })

    const roles: Role[] = await response.json()
    const role = roles.find(role => role.name === data.role.name)

    expect(response.status).toBe(200)
    expect(role && role.name).toBe(data.role.name)

    await data.clear()
  })

  it('should return one role', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_ALL_ROLES],
    })

    const response = await getRoleRequest({
      name: data.role.name,
      accessToken: data.access_token,
    })

    const role = await response.json()

    expect(response.status).toBe(200)
    expect(role && role.name).toBe(data.role.name)

    await data.clear()
  })

  it('should return permissions of role', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_ALL_ROLES],
    })

    const response = await getRolePermissionsRequest({
      name: data.role.name,
      accessToken: data.access_token,
    })

    const _permissions = await response.json()

    expect(response.status).toBe(200)
    expect(_permissions[0] && _permissions[0].name).toEqual(
      permissions.VIEW_ALL_ROLES,
    )

    await data.clear()
  })

  describe('error handling', () => {
    it('should return error if user have not permission', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await getRolesRequest({
        accessToken: data.access_token,
      })

      expect(response.status).toBe(403)

      await data.clear()
    })
  })
})
