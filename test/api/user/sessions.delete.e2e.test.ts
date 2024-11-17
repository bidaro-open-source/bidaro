import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import {
  destroyUser,
  loginRequest,
  registerUser,
} from '~/test/utils/requests/authentication'
import { deleteSessionsRequest } from '~/test/utils/requests/sessions'

describe('session deleting', async () => {
  await setup()

  it('should delete session', async () => {
    const data = await registerUser()

    const response = await deleteSessionsRequest({
      uid: data.user.id,
      uuids: [data.session_uuid],
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()

    await destroyUser(data.user.id)
  })

  it('should delete multiply sessions', async () => {
    const data = await registerUser()

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
      uid: data.user.id,
      uuids: [sessionUUID1, sessionUUID2],
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()
    expect(sessions[1]).toBeTruthy()

    await destroyUser(data.user.id)
  })

  it('should return false statuses when session not exists', async () => {
    const data = await registerUser()

    const response = await deleteSessionsRequest({
      uid: data.user.id,
      uuids: ['fff'],
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeFalsy()

    await destroyUser(data.user.id)
  })

  describe('error handling', () => {
    it('should return error if sessions is empty', async () => {
      const data = await registerUser()

      const response = await deleteSessionsRequest({
        uid: data.user.id,
        uuids: [],
        accessToken: data.access_token,
      })

      expect(response.status).toBe(422)

      await destroyUser(data.user.id)
    })

    it('should return error if sessions belongs to another user', async () => {
      const data1 = await registerUser()
      const data2 = await registerUser()

      const response = await deleteSessionsRequest({
        uid: data2.user.id,
        uuids: [data2.session_uuid],
        accessToken: data1.access_token,
      })

      expect(response.status).toBe(403)

      await destroyUser(data1.user.id)
      await destroyUser(data2.user.id)
    })
  })
})
