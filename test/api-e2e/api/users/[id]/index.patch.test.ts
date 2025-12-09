import type { UpdateUserRequest } from '../../../../../server/api/users/[id]/index.patch.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../utils/expect-api-error'

async function updateUserRequest(
  payload: UpdateUserRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}`, {
    method: 'PATCH',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PATCH /api/users/:id', async () => {
  const newName = 'UpdatedName'
  const newSurname = 'UpdatedSurname'

  it('should update user successfully', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_OWN_PROFILE],
    })

    const response = await updateUserRequest(
      {
        body: { name: newName, surname: newSurname },
        params: { id: userData.user.id },
      },
      { accessToken: userData.access_token },
    )

    const updatedUser = response._data

    expect(response.status).toBe(200)
    expect(updatedUser.name).toBe(newName)
    expect(updatedUser.surname).toBe(newSurname)

    await userData.clear()
  })

  it('should update user with null successfully', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_OWN_PROFILE],
    })

    const response = await updateUserRequest(
      {
        body: { name: null, surname: null },
        params: { id: userData.user.id },
      },
      { accessToken: userData.access_token },
    )

    const updatedUser = response._data

    expect(response.status).toBe(200)
    expect(updatedUser.name).toBe(null)
    expect(updatedUser.surname).toBe(null)

    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()

      const response = await updateUserRequest(
        {
          body: { name: newName, surname: newSurname },
          params: { id: userData.user.id },
        },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await updateUserRequest(
        {
          body: { name: newName, surname: newSurname },
          params: { id: userData.user.id },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await userData.clear()
    })

    it('should return 403 when updating another user', async () => {
      const userData1 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_OWN_PROFILE],
      })
      const userData2 = await createUser()

      const response = await updateUserRequest(
        {
          body: { name: newName, surname: newSurname },
          params: { id: userData2.user.id },
        },
        { accessToken: userData1.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await userData2.clear()
      await userData1.clear()
    })
  })
})
