import type { ViewUserRequest } from '../../../../../server/api/users/[id]/index.request'
import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../utils/expect-error'


async function viewUserRequest(
  payload: ViewUserRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/users/:id', async () => {
  it('should retrieve user profile with correct structure for authenticated user', async () => {
    const data = await createUser({ withSession: true })

    const response = await viewUserRequest(
      { params: { id: data.user.id } },
      { accessToken: data.access_token },
    )

    const user = response._data

    expect(user.id).toBe(data.user.id)
    expect(user.name).toBe(data.user.name)
    expect(user.surname).toBe(data.user.surname)
    expect(user.username).toBe(data.user.username)

    await data.clear()
  })

  it('should retrieve user profile with correct structure for anonymous user', async () => {
    const data = await createUser()

    const response = await viewUserRequest({ params: { id: data.user.id } })

    const user = response._data

    expect(user.id).toBe(data.user.id)
    expect(user.name).toBe(data.user.name)
    expect(user.surname).toBe(data.user.surname)
    expect(user.username).toBe(data.user.username)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 404 when user does not exist', async () => {
      const response = await viewUserRequest({ params: { id: 93475937459 } })

      expectApiError(response, 'USER_NOT_FOUND')
    })
  })
})
