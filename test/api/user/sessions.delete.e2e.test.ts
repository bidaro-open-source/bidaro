import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~/test/utils/creations/create-user'
import { loginRequest } from '~/test/utils/requests/authentication'
import { deleteSessionsRequest } from '~/test/utils/requests/sessions'
import { usePermissions } from '~/test/utils/use-permissions'

describe('session deleting', async () => {
  await setup()

  it('should delete session', async () => {
    const { mappedPermissionsId } = await usePermissions()

    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [mappedPermissionsId.DELETE_OWN_SESSIONS],
    })

    const response = await deleteSessionsRequest({
      uid: data.user.id,
      uuids: [data.session_uuid],
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0]).toBeTruthy()

    await data.clear()
  })

  it('should delete multiply sessions', async () => {
    const { mappedPermissionsId } = await usePermissions()

    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [mappedPermissionsId.DELETE_OWN_SESSIONS],
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
      uid: data.user.id,
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
    const { mappedPermissionsId } = await usePermissions()

    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [mappedPermissionsId.DELETE_OWN_SESSIONS],
    })

    const response = await deleteSessionsRequest({
      uid: data.user.id,
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
      const { mappedPermissionsId } = await usePermissions()

      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [mappedPermissionsId.DELETE_OWN_SESSIONS],
      })

      const response = await deleteSessionsRequest({
        uid: data.user.id,
        uuids: [],
        accessToken: data.access_token,
      })

      expect(response.status).toBe(422)

      await data.clear()
    })

    it('should return error if sessions belongs to another user', async () => {
      const { mappedPermissionsId } = await usePermissions()

      const data1 = await createUser({
        withSession: true,
      })

      const data2 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [mappedPermissionsId.DELETE_OWN_SESSIONS],
      })

      const response = await deleteSessionsRequest({
        uid: data1.user.id,
        uuids: [data1.session_uuid],
        accessToken: data2.access_token,
      })

      expect(response.status).toBe(403)

      await data1.clear()
      await data2.clear()
    })
  })
})
