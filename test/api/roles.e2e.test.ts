import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import type { Role } from '~/server/database'
import { createUser } from '~/test/utils/creations/create-user'
import { usePermissions } from '~/test/utils/use-permissions'
import {
  getRolePermissionsRequest,
  getRoleRequest,
  getRolesRequest,
} from '../utils/requests/roles'

describe('roles fetching', async () => {
  await setup()

  it('should return all roles', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.VIEW_ALL_ROLES)

    const response = await getRolesRequest({
      accessToken: data.loginData.access_token,
    })

    const roles: Role[] = await response.json()
    const role = roles.find(role => role.id === data.role.id)

    expect(response.status).toBe(200)
    expect(role && role.id).toBe(data.role.id)

    await data.user.destroy()
    await data.role.destroy()
  })

  it('should return one role', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.VIEW_ALL_ROLES)

    const response = await getRoleRequest({
      id: data.role.id,
      accessToken: data.loginData.access_token,
    })

    const role = await response.json()

    expect(response.status).toBe(200)
    expect(role && role.id).toBe(data.role.id)

    await data.user.destroy()
    await data.role.destroy()
  })

  it('should return permissions of role', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.VIEW_ALL_ROLES)

    const response = await getRolePermissionsRequest({
      id: data.role.id,
      accessToken: data.loginData.access_token,
    })

    expect(response.status).toBe(200)

    await data.user.destroy()
    await data.role.destroy()
  })

  describe('error handling', () => {
    it('should return error if user have not permission', async () => {
      const data = await createUser()

      const response = await getRolesRequest({
        accessToken: data.loginData.access_token,
      })

      expect(response.status).toBe(403)

      await data.user.destroy()
      await data.role.destroy()
    })
  })
})
