import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import type { RequestBody } from '~/server/requests/auth/login.post'

interface SessionsPayload {
  uid: number
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

async function fetchSessions(payload: SessionsPayload) {
  return await fetch(`/api/user/${payload.uid}/sessions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${payload.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

describe('session fetching', async () => {
  await setup()

  it('should return user sessions', async () => {
    const user = await db.UserFactory.new().create()

    const loginResponse = await makeLoginRequest({
      username: user.username,
      password: db.UserFactory.password,
    })

    const loginBody = await loginResponse.json()

    const response = await fetchSessions({
      uid: user.id,
      accessToken: loginBody.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0].uuid).toBe(loginBody.session_uuid)

    await user.destroy()
  })

  describe('error handling', () => {
    it('should return error if sessions belongs to another user', async () => {
      const user = await db.UserFactory.new().create()
      const anotherUser = await db.UserFactory.new().create()

      const loginResponse = await makeLoginRequest({
        username: user.username,
        password: db.UserFactory.password,
      })

      const loginBody = await loginResponse.json()

      const response = await fetchSessions({
        uid: anotherUser.id,
        accessToken: loginBody.access_token,
      })

      expect(response.status).toBe(403)

      await user.destroy()
    })
  })
})
