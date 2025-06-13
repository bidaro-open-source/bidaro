import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/utils/creations/create-user'
import { getUserRequest } from '~~/test/utils/requests/users'

describe('get /api/users/:id', async () => {
  await setup()

  it('should return the correct structure', async () => {
    const data = await createUser({ withSession: true })

    const response = await getUserRequest(
      { params: { id: data.user.id } },
      { accessToken: data.access_token },
    )

    const user = await response.json()

    expect(user.id).toBe(data.user.id)
    expect(user.name).toBe(data.user.name)
    expect(user.surname).toBe(data.user.surname)
    expect(user.username).toBe(data.user.username)

    await data.clear()
  })

  it('should return the correct structure for anonymous user', async () => {
    const data = await createUser()

    const response = await getUserRequest({ params: { id: data.user.id } })

    const user = await response.json()

    expect(user.id).toBe(data.user.id)
    expect(user.name).toBe(data.user.name)
    expect(user.surname).toBe(data.user.surname)
    expect(user.username).toBe(data.user.username)

    await data.clear()
  })

  describe('error handling', () => {
    it('should return 404 when user is not exists', async () => {
      const response = await getUserRequest({ params: { id: 123 } })

      expect(response.status).toBe(404)
    })
  })
})
