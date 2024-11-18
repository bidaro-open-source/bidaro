import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions as originalPermissions } from '~/server/constants'
import type { Permission } from '~/server/database'
import { createUser } from '~/test/utils/creations/create-user'
import { usePermissions } from '~/test/utils/use-permissions'
import {
  getPermissionRequest,
  getPermissionRolesRequest,
  getPermissionsRequest,
} from '../utils/requests/permissions'

describe('permissions fetching', async () => {
  await setup()

  it('should return all permissions', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.VIEW_ALL_PERMISSIONS)

    const response = await getPermissionsRequest({
      accessToken: data.loginData.access_token,
    })

    const _permissions: Permission[] = await response.json()
    const mappedPermissions = _permissions.map(val => val.name)

    expect(response.status).toBe(200)

    expect(Object.values(originalPermissions))
      .toEqual(expect.arrayContaining(mappedPermissions))

    await data.user.destroy()
    await data.role.destroy()
  })

  it('should return one permission', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.VIEW_ALL_PERMISSIONS)

    const response = await getPermissionRequest({
      id: permissions.VIEW_ALL_PERMISSIONS,
      accessToken: data.loginData.access_token,
    })

    const permission = await response.json()

    expect(response.status).toBe(200)
    expect(permission && permission.id).toBe(permissions.VIEW_ALL_PERMISSIONS)

    await data.user.destroy()
    await data.role.destroy()
  })

  it('should return roles of permission', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.VIEW_ALL_PERMISSIONS)

    const response = await getPermissionRolesRequest({
      id: permissions.VIEW_ALL_PERMISSIONS,
      accessToken: data.loginData.access_token,
    })

    expect(response.status).toBe(200)

    await data.user.destroy()
    await data.role.destroy()
  })

  describe('error handling', () => {
    it('should return error if user have not permission', async () => {
      const data = await createUser()

      const response = await getPermissionsRequest({
        accessToken: data.loginData.access_token,
      })

      expect(response.status).toBe(403)

      await data.user.destroy()
      await data.role.destroy()
    })
  })
})
