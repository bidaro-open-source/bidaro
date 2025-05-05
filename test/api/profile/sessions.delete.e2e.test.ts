import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/utils/creations/create-user'
import { loginRequest } from '~~/test/utils/requests/authentication'
import { deleteSessionsRequest } from '~~/test/utils/requests/sessions'

describe('session deleting', async () => {
  await setup()

  it('should delete session', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_OWN_SESSIONS],
    })

    const response = await deleteSessionsRequest({
      uuids: [data.session_uuid],
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()

    await data.clear()
  })

  it('should delete multiply sessions', async () => {
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
    ).json()).session_uuid

    const sessionUUID2 = (await (
      await loginRequest(loginRequestBody)
    ).json()).session_uuid

    const response = await deleteSessionsRequest({
      uuids: [sessionUUID1, sessionUUID2],
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()
    expect(sessions[1]).toBeTruthy()

    await data.clear()
  })

  it('should return false statuses when session not exists', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_OWN_SESSIONS],
    })

    const response = await deleteSessionsRequest({
      uuids: ['fff'],
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeFalsy()

    await data.clear()
  })

  describe('error handling', () => {
    it('should return error if sessions is empty', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_OWN_SESSIONS],
      })

      const response = await deleteSessionsRequest({
        uuids: [],
        accessToken: data.access_token,
      })

      expect(response.status).toBe(422)

      await data.clear()
    })

    it('should return error if user have not permissions', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await deleteSessionsRequest({
        uuids: [data.session_uuid],
        accessToken: data.access_token,
      })

      expect(response.status).toBe(403)

      await data.clear()
    })
  })
})
