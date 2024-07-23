import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { destroyUser, registerUser } from '~/test/utils/requests/authentication'
import { getSessionsRequest } from '~/test/utils/requests/sessions'

describe('session fetching', async () => {
  await setup()

  it('should return user sessions', async () => {
    const data = await registerUser()

    const response = await getSessionsRequest({
      uid: data.user.id,
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0].uuid).toBe(data.session_uuid)

    await destroyUser(data.user.id)
  })

  describe('error handling', () => {
    it('should return error if sessions belongs to another user', async () => {
      const data = await registerUser()
      const anotherData = await registerUser()

      const response = await getSessionsRequest({
        uid: data.user.id,
        accessToken: anotherData.access_token,
      })

      expect(response.status).toBe(403)

      await destroyUser(data.user.id)
      await destroyUser(anotherData.user.id)
    })
  })
})
