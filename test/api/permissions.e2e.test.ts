import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
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
    const { permissions, mappedPermissionsId } = await usePermissions()

    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [mappedPermissionsId.VIEW_ALL_PERMISSIONS],
    })

    const response = await getPermissionsRequest({
      accessToken: data.access_token,
    })

    const _permissions: Permission[] = await response.json()
    const mappedPermissions = _permissions.map(val => val.name)

    expect(response.status).toBe(200)
    expect(permissions).toEqual(expect.arrayContaining(mappedPermissions))

    await data.clear()
  })

  it('should return one permission', async () => {
    const { mappedPermissionsId } = await usePermissions()

    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [mappedPermissionsId.VIEW_ALL_PERMISSIONS],
    })

    const response = await getPermissionRequest({
      id: mappedPermissionsId.VIEW_ALL_PERMISSIONS,
      accessToken: data.access_token,
    })

    const permission = await response.json()

    expect(response.status).toBe(200)
    expect(permission && permission.id).toBe(
      mappedPermissionsId.VIEW_ALL_PERMISSIONS,
    )

    await data.clear()
  })

  it('should return roles of permission', async () => {
    const { mappedPermissionsId } = await usePermissions()

    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [mappedPermissionsId.VIEW_ALL_PERMISSIONS],
    })

    const response = await getPermissionRolesRequest({
      id: mappedPermissionsId.VIEW_ALL_PERMISSIONS,
      accessToken: data.access_token,
    })

    expect(response.status).toBe(200)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return error if user have not permission', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await getPermissionsRequest({
        accessToken: data.access_token,
      })

      expect(response.status).toBe(403)

      await data.clear()
    })
  })
})
