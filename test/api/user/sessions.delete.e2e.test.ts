import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~/test/utils/creations/create-user'
import { loginRequest } from '~/test/utils/requests/authentication'
import { deleteSessionsRequest } from '~/test/utils/requests/sessions'
import { usePermissions } from '~/test/utils/use-permissions'

describe('session deleting', async () => {
  await setup()

  it('should delete session', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.DELETE_OWN_SESSIONS)

    const response = await deleteSessionsRequest({
      uid: data.user.id,
      uuids: [data.loginData.session_uuid],
      accessToken: data.loginData.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()

    await data.user.destroy()
    await data.role.destroy()
  })

  it('should delete multiply sessions', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.DELETE_OWN_SESSIONS)

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
      accessToken: data.loginData.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()
    expect(sessions[1]).toBeTruthy()

    await data.user.destroy()
    await data.role.destroy()
  })

  it('should return false statuses when session not exists', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.DELETE_OWN_SESSIONS)

    const response = await deleteSessionsRequest({
      uid: data.user.id,
      uuids: ['fff'],
      accessToken: data.loginData.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeFalsy()

    await data.user.destroy()
    await data.role.destroy()
  })

  describe('error handling', () => {
    it('should return error if sessions is empty', async () => {
      const permissions = await usePermissions(db)

      const data = await createUser(permissions.DELETE_OWN_SESSIONS)

      const response = await deleteSessionsRequest({
        uid: data.user.id,
        uuids: [],
        accessToken: data.loginData.access_token,
      })

      expect(response.status).toBe(422)

      await data.user.destroy()
      await data.role.destroy()
    })

    it('should return error if sessions belongs to another user', async () => {
      const permissions = await usePermissions(db)

      const data1 = await createUser(permissions.DELETE_OWN_SESSIONS)
      const data2 = await createUser(permissions.DELETE_OWN_SESSIONS)

      const response = await deleteSessionsRequest({
        uid: data2.user.id,
        uuids: [data2.loginData.session_uuid],
        accessToken: data1.loginData.access_token,
      })

      expect(response.status).toBe(403)

      await data1.user.destroy()
      await data1.role.destroy()
      await data2.user.destroy()
      await data2.role.destroy()
    })
  })
})
