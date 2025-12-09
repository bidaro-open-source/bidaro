import type { CreateRoleRequest } from '../../../../server/api/roles/index.post.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../utils/expect-error'


async function createRoleRequest(
  payload: CreateRoleRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/roles`, {
    method: 'POST',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

async function destroyRole(name: string) {
  return await db.Role.destroy({ where: { name } })
}

describe('POST /api/roles', async () => {
  it('should create role successfully', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CREATE_ROLE],
    })

    const { name, displayName, description } = db.RoleFactory.new().make()

    const response = await createRoleRequest(
      { body: { name, displayName, description } },
      { accessToken: userData.access_token },
    )

    const role = response._data

    expect(response.status).toBe(201)
    expect(role.name).toBe(name)
    expect(role.displayName).toBe(displayName)
    expect(role.description).toBe(description)

    await destroyRole(role.name)
    await userData.clear()
  })

  it('should create role with only name', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CREATE_ROLE],
    })

    const { name } = db.RoleFactory.new().make()

    const response = await createRoleRequest(
      { body: { name } },
      { accessToken: userData.access_token },
    )

    const role = response._data

    expect(response.status).toBe(201)
    expect(role.name).toBe(name)
    expect(role.displayName).toBe(null)
    expect(role.description).toBe(null)

    await destroyRole(role.name)
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { name } = db.RoleFactory.new().make()

      const response = await createRoleRequest(
        { body: { name } },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const { name } = db.RoleFactory.new().make()

      const response = await createRoleRequest(
        { body: { name } },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await userData.clear()
    })

    it('should return 422 when role name already exists', async () => {
      const roleData = await db.RoleFactory.new().create()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CREATE_ROLE],
      })

      const response = await createRoleRequest(
        { body: { name: roleData.name, displayName: roleData.displayName } },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'ROLE_NAME_TAKEN')

      await roleData.destroy()
      await userData.clear()
    })
  })
})
