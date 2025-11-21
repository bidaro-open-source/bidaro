import type { UpdateImageOrderRequest } from './index.post.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createImage } from '~~/test/api-e2e/arrangers/create-image'
import { createLotImage } from '~~/test/api-e2e/arrangers/create-lot-image'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { resolveImage } from '~~/test/api-e2e/utils/resolve-image'

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
  await setup({ host: env.SETUP_HOST })

  const IMAGE_PATH = resolveImage('image-normal.png').path

  it('should reorder lot images successfully', async () => {
    const userData = await createUser({ withSession: true })
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

      expect(response.status).toBe(401)
    })

    it('should return 404 when lot does not exist', async () => {
      const userData = await createUser({ withSession: true })

      const response = await updateImageOrderRequest(
        { body: { ids: [1] }, params: { id: 93475937459 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)

      await userData.clear()
    })

    it('should return 403 when user is not the lot owner', async () => {
      const user1Data = await createUser()
      const user2Data = await createUser({ withSession: true })
      const lotData = await createLot({ sellerId: user1Data.user.id })

      const imageData = await createImage(IMAGE_PATH)
      await createLotImage(lotData.lot.id, imageData.image.id)

      const response = await updateImageOrderRequest(
        { body: { ids: [imageData.image.id] }, params: { id: lotData.lot.id } },
        { accessToken: user2Data.access_token },
      )

      expect(response.status).toBe(403)

      await imageData.clear()
      await lotData.clear()
      await user1Data.clear()
      await user2Data.clear()
    })

    it('should return 422 when image IDs count does not match existing images', async () => {
      const userData = await createUser({ withSession: true })
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

      expect(getResponse.status).toBe(422)

      await imageData2.clear()
      await imageData1.clear()
      await lotData.clear()
      await userData.clear()
    })

    it('should return 422 when image IDs contain foreign image from different lot', async () => {
      const userData = await createUser({ withSession: true })
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

      expect(getResponse.status).toBe(422)

      await imageData2.clear()
      await imageData1.clear()
      await lotData2.clear()
      await lotData1.clear()
      await userData.clear()
    })
  })
})
