import type { DeleteUserRequest } from './index.delete.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function deleteUserRequest(
  payload: DeleteUserRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/users/${payload.params.id}`, {
    method: 'DELETE',
    accessToken: options.accessToken,
  })
}

describe('DELETE /api/users/:id', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should delete user successfully', async () => {
    const userData = await createUser()
    const adminData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_USER],
    })

    const userId = userData.user.id

    const response = await deleteUserRequest(
      { params: { id: userId } },
      { accessToken: adminData.access_token },
    )

    expect(response.status).toBe(204)

    // Verify the user was deleted from the database
    const deletedUser = await db.User.findByPk(userId)
    expect(deletedUser).toBeNull()

    await adminData.clear()
  })

  it('should delete user with lots and bids', async () => {
    const userData = await createUser()
    const adminData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_USER],
    })

    // Create a lot for the user
    const lot = await db.LotFactory.new().create({ sellerId: userData.user.id })

    // Create a bid by the user on another lot
    const anotherUser = await createUser()
    const anotherLot = await db.LotFactory.new().create({ sellerId: anotherUser.user.id })
    const bet = await db.LotBetFactory.new().create({
      lotId: anotherLot.id,
      userId: userData.user.id,
    })

    const userId = userData.user.id

    const response = await deleteUserRequest(
      { params: { id: userId } },
      { accessToken: adminData.access_token },
    )

    expect(response.status).toBe(204)

    // Verify the user was deleted
    const deletedUser = await db.User.findByPk(userId)
    expect(deletedUser).toBeNull()

    // Verify the lot was cascade deleted
    const deletedLot = await db.Lot.findByPk(lot.id)
    expect(deletedLot).toBeNull()

    // Verify the bid was deleted
    const deletedBet = await db.LotBet.findByPk(bet.id)
    expect(deletedBet).toBeNull()

    await anotherUser.clear()
    await adminData.clear()
  })

  it('should delete user with sessions', async () => {
    const userData = await createUser({ withSession: true })
    const adminData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_USER],
    })

    const userId = userData.user.id

    const response = await deleteUserRequest(
      { params: { id: userId } },
      { accessToken: adminData.access_token },
    )

    expect(response.status).toBe(204)

    // Verify the user was deleted
    const deletedUser = await db.User.findByPk(userId)
    expect(deletedUser).toBeNull()

    await adminData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()

      const response = await deleteUserRequest({
        params: { id: userData.user.id },
      })

      expect(response.status).toBe(401)

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser()
      const adminData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await deleteUserRequest(
        { params: { id: userData.user.id } },
        { accessToken: adminData.access_token },
      )

      expect(response.status).toBe(403)

      await userData.clear()
      await adminData.clear()
    })

    it('should return 404 when user does not exist', async () => {
      const adminData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_USER],
      })

      const response = await deleteUserRequest(
        { params: { id: 93475937459 } },
        { accessToken: adminData.access_token },
      )

      expect(response.status).toBe(404)

      await adminData.clear()
    })
  })
})
