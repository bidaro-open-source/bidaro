import type { UpdateImageOrderRequest } from '../../../../../../../server/api/lots/[id]/images/update-order/index.post.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createImage } from '~~/test/api-e2e/arrangers/create-image'
import { createLotImage } from '~~/test/api-e2e/arrangers/create-lot-image'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { resolveImage } from '~~/test/api-e2e/utils/resolve-image'
import { expectApiError } from '../../../../../utils/expect-error'


async function updateImageOrderRequest(
  payload: UpdateImageOrderRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/images/update-order`, {
    method: 'POST',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('POST /api/lots/:id/images/update-order', async () => {
  const IMAGE_PATH = resolveImage('image-normal.png').path

  it('should reorder lot images successfully', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_LOT_IMAGE_ORDER],
    })
    const lotData = await createLot({ sellerId: userData.user.id })

    const imageData1 = await createImage(IMAGE_PATH)
    await createLotImage(lotData.lot.id, imageData1.image.id)

    const imageData2 = await createImage(IMAGE_PATH)
    await createLotImage(lotData.lot.id, imageData2.image.id)

    const imageData3 = await createImage(IMAGE_PATH)
    await createLotImage(lotData.lot.id, imageData3.image.id)

    const ids = [imageData2.image.id, imageData3.image.id, imageData1.image.id]
    const getResponse = await updateImageOrderRequest(
      { body: { ids }, params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    expect(getResponse.status).toBe(204)

    const newLinks = await db.LotImage.findAll({
      where: { lotId: lotData.lot.id },
      order: [['order', 'ASC']],
    })

    expect(newLinks[0].order).toBe(0)
    expect(newLinks[0].imageId).toBe(imageData2.image.id)

    expect(newLinks[1].order).toBe(1)
    expect(newLinks[1].imageId).toBe(imageData3.image.id)

    expect(newLinks[2].order).toBe(2)
    expect(newLinks[2].imageId).toBe(imageData1.image.id)

    await imageData3.clear()
    await imageData2.clear()
    await imageData1.clear()
    await lotData.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await updateImageOrderRequest(
        { body: { ids: [1] }, params: { id: 945395394 } },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })
      const lotData = await createLot({ sellerId: userData.user.id })

      const response = await updateImageOrderRequest(
        { body: { ids: [1] }, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await lotData.clear()
      await userData.clear()
    })

    it('should return 404 when lot does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_LOT_IMAGE_ORDER],
      })

      const response = await updateImageOrderRequest(
        { body: { ids: [1] }, params: { id: 93475937459 } },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'LOT_NOT_FOUND')

      await userData.clear()
    })

    it('should return 403 when user is not the lot owner', async () => {
      const user1Data = await createUser()
      const user2Data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_LOT_IMAGE_ORDER],
      })
      const lotData = await createLot({ sellerId: user1Data.user.id })

      const imageData = await createImage(IMAGE_PATH)
      await createLotImage(lotData.lot.id, imageData.image.id)

      const response = await updateImageOrderRequest(
        { body: { ids: [imageData.image.id] }, params: { id: lotData.lot.id } },
        { accessToken: user2Data.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await imageData.clear()
      await lotData.clear()
      await user1Data.clear()
      await user2Data.clear()
    })

    it('should return 422 when image IDs count does not match existing images', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_LOT_IMAGE_ORDER],
      })
      const lotData = await createLot({ sellerId: userData.user.id })

      const imageData1 = await createImage(IMAGE_PATH)
      await createLotImage(lotData.lot.id, imageData1.image.id)

      const imageData2 = await createImage(IMAGE_PATH)
      await createLotImage(lotData.lot.id, imageData2.image.id)

      const ids = [imageData1.image.id]
      const getResponse = await updateImageOrderRequest(
        { body: { ids }, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expectApiError(getResponse, 'LOT_IMAGE_ORDER_INVALID')

      await imageData2.clear()
      await imageData1.clear()
      await lotData.clear()
      await userData.clear()
    })

    it('should return 422 when image IDs contain foreign image from different lot', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_LOT_IMAGE_ORDER],
      })
      const lotData1 = await createLot({ sellerId: userData.user.id })
      const lotData2 = await createLot({ sellerId: userData.user.id })

      const imageData1 = await createImage(IMAGE_PATH)
      await createLotImage(lotData1.lot.id, imageData1.image.id)

      const imageData2 = await createImage(IMAGE_PATH)
      await createLotImage(lotData2.lot.id, imageData2.image.id)

      const ids = [imageData2.image.id]
      const getResponse = await updateImageOrderRequest(
        { body: { ids }, params: { id: lotData1.lot.id } },
        { accessToken: userData.access_token },
      )

      expectApiError(getResponse, 'LOT_IMAGE_ORDER_INVALID')

      await imageData2.clear()
      await imageData1.clear()
      await lotData2.clear()
      await lotData1.clear()
      await userData.clear()
    })
  })
})
