import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import type { RequestBody } from '~/server/requests/auth/login.post'

interface DeleteSessionsPayload {
  uid: number
  uuids: string[]
  accessToken: string
}

async function makeLoginRequest(body: RequestBody) {
  return await fetch('/api/auth/login', {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

async function deleteSessions(payload: DeleteSessionsPayload) {
  return await fetch(`/api/user/${payload.uid}/sessions`, {
    method: 'DELETE',
    body: JSON.stringify({ uuids: payload.uuids }),
    headers: {
      'Authorization': `Bearer ${payload.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

describe('session deleting', async () => {
  await setup()

  it('should delete session', async () => {
    const user = await db.UserFactory.new().create()

    const loginResponse = await makeLoginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    const loginBody = await loginResponse.json()

    const response = await deleteSessions({
      uid: user.id,
      uuids: [loginBody.session_token],
      accessToken: loginBody.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()

    await user.destroy()
  })

  it('should delete multiply sessions', async () => {
    const user = await db.UserFactory.new().create()

    const loginRequestBody = {
      username: user.username,
      password: db.UserFactory.password,
    }

    const accessToken = (await (
      await makeLoginRequest(loginRequestBody)
    ).json()).access_token

    const sessionToken1 = (await (
      await makeLoginRequest(loginRequestBody)
    ).json()).session_token

    const sessionToken2 = (await (
      await makeLoginRequest(loginRequestBody)
    ).json()).session_token

    const response = await deleteSessions({
      uid: user.id,
      uuids: [sessionToken1, sessionToken2],
      accessToken,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()
    expect(sessions[1]).toBeTruthy()

    await user.destroy()
  })

  it('should return false statuses when session not exists', async () => {
    const user = await db.UserFactory.new().create()

    const loginResponse = await makeLoginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    const loginBody = await loginResponse.json()

    const response = await deleteSessions({
      uid: user.id,
      uuids: ['936acb91-9837-4d4c-a6ec-a6d02a72eb52'],
      accessToken: loginBody.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeFalsy()

    await user.destroy()
  })

  describe('error handling', () => {
    it('should return error if sessions is empty', async () => {
      const user = await db.UserFactory.new().create()

      const loginResponse = await makeLoginRequest({
        username: user.username,
        password: db.UserFactory.password,
      })

      const loginBody = await loginResponse.json()

      const response = await deleteSessions({
        uid: user.id,
        uuids: [],
        accessToken: loginBody.access_token,
      })

      expect(response.status).toBe(422)

      await user.destroy()
    })

    it('should return error if sessions is not uuid', async () => {
      const user = await db.UserFactory.new().create()

      const loginResponse = await makeLoginRequest({
        username: user.username,
        password: db.UserFactory.password,
      })

      const loginBody = await loginResponse.json()

      const response = await deleteSessions({
        uid: user.id,
        uuids: ['hello-world'],
        accessToken: loginBody.access_token,
      })

      expect(response.status).toBe(422)

      await user.destroy()
    })

    it('should return error if sessions belongs to another user', async () => {
      const user1 = await db.UserFactory.new().create()
      const user2 = await db.UserFactory.new().create()

      const loginResponse = await makeLoginRequest({
        username: user1.username,
        password: db.UserFactory.password,
      })

      const loginBody = await loginResponse.json()

      const response = await deleteSessions({
        uid: user2.id,
        uuids: ['936acb91-9837-4d4c-a6ec-a6d02a72eb52'],
        accessToken: loginBody.access_token,
      })

      expect(response.status).toBe(403)

      await user1.destroy()
      await user2.destroy()
    })
  })
})
