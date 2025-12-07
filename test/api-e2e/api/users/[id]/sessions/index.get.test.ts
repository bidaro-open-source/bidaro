import type { ViewSessionsRequest } from '../../../../../../server/api/users/[id]/sessions/index.get.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewSessionsRequest(
  payload: ViewSessionsRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}/sessions`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/profile/sessions', async () => {
  it('should retrieve user sessions successfully', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_OWN_SESSIONS],
    })

    const response = await viewSessionsRequest(
      { params: { id: data.user.id } },
      { accessToken: data.access_token },
    )

    const sessions = response._data

    expect(response.status).toBe(200)
    expect(sessions[0].uuid).toBe(data.session_uuid)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const user = await createUser({ withSession: true })

      const response = await viewSessionsRequest(
        { params: { id: user.user.id } },
      )

      expect(response.status).toBe(401)
      expect(response._data.code).toBe('AUTHENTICATION_REQUIRED')

      await user.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await viewSessionsRequest(
        { params: { id: data.user.id } },
        { accessToken: data.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.code).toBe('FORBIDDEN')

      await data.clear()
    })
  })
})
