import type { DeleteSessionsRequest } from '../../../../../../server/api/users/[id]/sessions/index.delete.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { loginRequest } from '~~/test/api-e2e/requests/authentication'

async function deleteSessionsRequest(
  payload: DeleteSessionsRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}/sessions`, {
    method: 'DELETE',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('DELETE /api/profile/sessions', async () => {
  it('should delete single session successfully', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_OWN_SESSIONS],
    })

    const response = await deleteSessionsRequest(
      {
        body: { uuids: [data.session_uuid] },
        params: { id: data.user.id },
      },
      { accessToken: data.access_token },
    )

    const sessions = response._data

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()

    await data.clear()
  })

  it('should delete multiple sessions in batch successfully', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_OWN_SESSIONS],
    })

    const loginRequestBody = {
      username: data.user.username,
      password: db.UserFactory.password,
    }

    const sessionUUID1 = (await (
      await loginRequest(loginRequestBody)
    )._data).session_uuid

    const sessionUUID2 = (await (
      await loginRequest(loginRequestBody)
    )._data).session_uuid

    const response = await deleteSessionsRequest(
      {
        body: { uuids: [sessionUUID1, sessionUUID2] },
        params: { id: data.user.id },
      },
      { accessToken: data.access_token },
    )

    const sessions = response._data

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()
    expect(sessions[1]).toBeTruthy()

    await data.clear()
  })

  it('should return false status for non-existent sessions', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_OWN_SESSIONS],
    })

    const response = await deleteSessionsRequest(
      {
        body: { uuids: ['fff'] },
        params: { id: data.user.id },
      },
      { accessToken: data.access_token },
    )

    const sessions = response._data

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeFalsy()

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const data = await createUser({ withSession: true })

      const response = await deleteSessionsRequest(
        {
          body: { uuids: [data.session_uuid] },
          params: { id: data.user.id },
        },
      )

      expect(response.status).toBe(401)
      expect(response._data.code).toBe('AUTHENTICATION_REQUIRED')

      await data.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await deleteSessionsRequest(
        {
          body: { uuids: [data.session_uuid] },
          params: { id: data.user.id },
        },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.code).toBe('FORBIDDEN')

      await data.clear()
    })

    it('should return 403 when deleting another user\'s sessions', async () => {
      const data1 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_OWN_SESSIONS],
      })
      const data2 = await createUser({
        withSession: true,
      })

      const response = await deleteSessionsRequest(
        {
          body: { uuids: [data2.session_uuid] },
          params: { id: data2.user.id },
        },
        { accessToken: data1.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.code).toBe('FORBIDDEN')

      await data2.clear()
      await data1.clear()
    })

    it('should return 422 when session list is empty', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_OWN_SESSIONS],
      })

      const response = await deleteSessionsRequest(
        {
          body: { uuids: [] },
          params: { id: data.user.id },
        },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(422)
      expect(response._data.code).toBe('VALIDATION_ERROR')

      await data.clear()
    })
  })
})
