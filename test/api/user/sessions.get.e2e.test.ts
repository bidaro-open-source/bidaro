import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~/test/utils/creations/create-user'
import { getSessionsRequest } from '~/test/utils/requests/sessions'
import { usePermissions } from '~/test/utils/use-permissions'

describe('session fetching', async () => {
  await setup()

  it('should return user sessions', async () => {
    const { mappedPermissionsId } = await usePermissions()

    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [mappedPermissionsId.VIEW_OWN_SESSIONS],
    })

    const response = await getSessionsRequest({
      uid: data.user.id,
      accessToken: data.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0].uuid).toBe(data.session_uuid)

    await data.clear()
  })

  it('should return user sessions when user have permission', async () => {
    const { mappedPermissionsId } = await usePermissions()

    const data1 = await createUser({
      withSession: true,
    })

    const data2 = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [mappedPermissionsId.VIEW_ALL_SESSIONS],
    })

    const response = await getSessionsRequest({
      uid: data1.user.id,
      accessToken: data2.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0].uuid).toBe(data1.session_uuid)

    await data1.clear()
    await data2.clear()
  })

  describe('error handling', () => {
    it('should return error if sessions belongs to another user', async () => {
      const { mappedPermissionsId } = await usePermissions()

      const data1 = await createUser({
        withSession: true,
      })

      const data2 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [mappedPermissionsId.VIEW_OWN_SESSIONS],
      })

      const response = await getSessionsRequest({
        uid: data1.user.id,
        accessToken: data2.access_token,
      })

      expect(response.status).toBe(403)

      await data1.clear()
      await data2.clear()
    })
  })
})
