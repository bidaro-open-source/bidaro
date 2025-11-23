import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function getRoleRequest(
  name: string,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/roles/${name}`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/roles/[name]', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return role with permissions', async () => {
    const roleData = await db.RoleFactory.new().create()
    await roleData.addPermissions([permissions.VIEW_PERMISSIONS])

    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_ROLES],
    })

    const response = await getRoleRequest(roleData.name, { accessToken: userData.access_token })

    expect(response.status).toBe(200)
    expect(response._data.name).toBe(roleData.name)
    expect(response._data.displayName).toBe(roleData.displayName)
    expect(response._data.description).toBe(roleData.description)
    expect(Array.isArray(response._data.permissions)).toBe(true)
    expect(response._data.permissions.length).toBe(1)
    expect(response._data.permissions[0].name).toBe(permissions.VIEW_PERMISSIONS)

    await roleData.destroy()
    await userData.clear()
  })

  it('should return 404 when role does not exist', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_ROLES],
    })

    const response = await getRoleRequest('nonexistent', { accessToken: userData.access_token })

    expect(response.status).toBe(404)

    await userData.clear()
  })

  it('should return 401 when user is not authenticated', async () => {
    const response = await getRoleRequest('test')

    expect(response.status).toBe(401)
  })

  it('should return 403 when user lacks required permission', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [],
    })

    const response = await getRoleRequest('test', { accessToken: userData.access_token })

    expect(response.status).toBe(403)

    await userData.clear()
  })
})
