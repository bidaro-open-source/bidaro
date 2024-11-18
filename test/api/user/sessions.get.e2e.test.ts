import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~/test/utils/creations/create-user'
import { getSessionsRequest } from '~/test/utils/requests/sessions'
import { usePermissions } from '~/test/utils/use-permissions'

describe('session fetching', async () => {
  await setup()

  it('should return user sessions', async () => {
    const permissions = await usePermissions(db)

    const data = await createUser(permissions.VIEW_OWN_SESSIONS)

    const response = await getSessionsRequest({
      uid: data.user.id,
      accessToken: data.loginData.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0].uuid).toBe(data.loginData.session_uuid)

    await data.user.destroy()
    await data.role.destroy()
  })

  it('should return user sessions when user have permission', async () => {
    const permissions = await usePermissions(db)

    const data1 = await createUser(permissions.VIEW_ALL_SESSIONS)
    const data2 = await createUser(permissions.VIEW_OWN_SESSIONS)

    const response = await getSessionsRequest({
      uid: data2.user.id,
      accessToken: data1.loginData.access_token,
    })

    const sessions = await response.json()

    expect(response.status).toBe(200)
    expect(sessions[0].uuid).toBe(data2.loginData.session_uuid)

    await data1.user.destroy()
    await data1.role.destroy()
    await data2.user.destroy()
    await data2.role.destroy()
  })

  describe('error handling', () => {
    it('should return error if sessions belongs to another user', async () => {
      const permissions = await usePermissions(db)

      const data1 = await createUser(permissions.VIEW_OWN_SESSIONS)
      const data2 = await createUser(permissions.VIEW_OWN_SESSIONS)

      const response = await getSessionsRequest({
        uid: data2.user.id,
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
