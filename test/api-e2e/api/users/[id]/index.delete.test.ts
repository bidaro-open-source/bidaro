import type { DeleteUserRequest } from '../../../../../server/api/users/[id]/index.delete.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createImage } from '~~/test/api-e2e/arrangers/create-image'
import { createLotImage } from '~~/test/api-e2e/arrangers/create-lot-image'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { getS3Object } from '~~/test/api-e2e/arrangers/get-s3-object'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { createPublishedLot } from '~~/test/api-e2e/arrangers/lots/create-published-lot'
import { createWinnerLot } from '~~/test/api-e2e/arrangers/lots/create-winner-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { resolveImage } from '~~/test/api-e2e/utils/resolve-image'
import { expectApiError } from '../../../utils/expect-error'


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

    const deletedUser = await db.User.findByPk(userId)

    expect(response.status).toBe(204)
    expect(deletedUser).toBeNull()

    await adminData.clear()
  })

  it('should delete user with everything related to it', async () => {
    const adminData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_USER],
    })

    const userData = await createUser()
    const winnerData = await createUser()
    const otherOwnerData = await createUser()
    const categoryData = await createCategory()

    const lotDrafted = await createLot({
      sellerId: userData.user.id,
    })

    const imageData = await createImage(resolveImage('image-normal.png').path)
    const lotImageData = await createLotImage(lotDrafted.lot.id, imageData.image.id)

    const lotPublished = await createPublishedLot({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
    })

    const lotWithWinner = await createWinnerLot({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
      winnerId: winnerData.user.id,
    })

    const otherLot = await createWinnerLot({
      sellerId: otherOwnerData.user.id,
      categoryId: categoryData.category.id,
      winnerId: userData.user.id,
    })

    const response = await deleteUserRequest(
      { params: { id: userData.user.id } },
      { accessToken: adminData.access_token },
    )

    const deletedUser = await db.User.findByPk(userData.user.id)
    const deletedLotDrafted = await db.Lot.findByPk(lotDrafted.lot.id)
    const deletedLotPublished = await db.Lot.findByPk(lotPublished.lot.id)
    const deletedLotWithWinner = await db.Lot.findByPk(lotWithWinner.lot.id)
    const deletedLotImage = await db.LotImage.findByPk(lotImageData.lotImage.id)
    const deletedImage = await db.Image.findByPk(imageData.image.id)
    const deletedBet = await db.LotBet.findByPk(lotWithWinner.bet.id)
    const updatedOtherLot = await db.Lot.findByPk(otherLot.lot.id)

    expect(response.status).toBe(204)
    expect(deletedUser).toBeNull()
    expect(deletedLotDrafted).toBeNull()
    expect(deletedLotPublished).toBeNull()
    expect(deletedLotWithWinner).toBeNull()
    expect(deletedLotImage).toBeNull()
    expect(deletedImage).toBeNull()
    expect(deletedBet).toBeNull()
    expect(updatedOtherLot?.winnerId).toBeNull()
    await expect(
      async () => getS3Object(
        imageData.image.bucket,
        imageData.image.key,
      ),
    ).rejects.toThrowError()

    await otherOwnerData.clear()
    await winnerData.clear()
    await categoryData.clear()
    await adminData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()

      const response = await deleteUserRequest({
        params: { id: userData.user.id },
      })

      expectApiError(response, 'AUTHENTICATION_REQUIRED')

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

      expectApiError(response, 'FORBIDDEN')

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

      expectApiError(response, 'USER_NOT_FOUND')

      await adminData.clear()
    })
  })
})
