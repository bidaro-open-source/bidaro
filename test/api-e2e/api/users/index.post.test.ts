import type { CreateUserRequest } from '~~/server/api/users/index.post.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { destroyUser } from '../../requests/authentication'
import { expectApiError } from '../../utils/expect-api-error'

async function createUserRequest(
  payload: CreateUserRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users`, {
    method: 'POST',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('POST /api/users', async () => {
  it('should create user successfully without role', async () => {
    const adminData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CREATE_USER],
    })

    const { email, username, password } = db.UserFactory.new().make()

    const response = await createUserRequest(
      { body: { email, username, password } },
      { accessToken: adminData.access_token },
    )

    const user = response._data

    expect(response.status).toBe(201)
    expect(user.id).toBeDefined()
    expect(user.username).toBe(username)
    expect(user.name).toBe(null)
    expect(user.surname).toBe(null)

    await destroyUser(user.id)
    await adminData.clear()
  })

  it('should create user successfully with role', async () => {
    const roleData = await db.RoleFactory.new().create()
    const adminData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CREATE_USER],
    })

    const { email, username, password } = db.UserFactory.new().make()

    const response = await createUserRequest(
      { body: { email, username, password, roleName: roleData.name } },
      { accessToken: adminData.access_token },
    )

    const user = response._data

    expect(response.status).toBe(201)
    expect(user.id).toBeDefined()

    await destroyUser(user.id)
    await adminData.clear()
    await roleData.destroy()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { email, username, password } = db.UserFactory.new().make()

      const response = await createUserRequest({
        body: { email, username, password },
      })

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const adminData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const { email, username, password } = db.UserFactory.new().make()

      const response = await createUserRequest(
        { body: { email, username, password } },
        { accessToken: adminData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await adminData.clear()
    })

    it('should return 422 when email is already in use', async () => {
      const existingUser = await createUser()
      const adminData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CREATE_USER],
      })

      const { username, password } = db.UserFactory.new().make()

      const response = await createUserRequest(
        { body: { email: existingUser.user.email, username, password } },
        { accessToken: adminData.access_token },
      )

      expectApiError(response, 'VALIDATION_ERROR')

      await existingUser.clear()
      await adminData.clear()
    })

    it('should return 422 when username is already in use', async () => {
      const existingUser = await createUser()
      const adminData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CREATE_USER],
      })

      const { email, password } = db.UserFactory.new().make()

      const response = await createUserRequest(
        { body: { email, username: existingUser.user.username, password } },
        { accessToken: adminData.access_token },
      )

      expectApiError(response, 'VALIDATION_ERROR')

      await existingUser.clear()
      await adminData.clear()
    })
  })
})
