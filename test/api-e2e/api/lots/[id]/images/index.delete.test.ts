import type { DeleteLotImageRequest } from '../../../../../../server/api/lots/[id]/images/index.delete.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createImage } from '~~/test/api-e2e/arrangers/create-image'
import { createLotImage } from '~~/test/api-e2e/arrangers/create-lot-image'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { resolveImage } from '~~/test/api-e2e/utils/resolve-image'

async function deleteLotImageRequest(
  payload: DeleteLotImageRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/images`, {
    method: 'DELETE',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('DELETE /api/lots/:id/images', async () => {
  const IMAGE_PATH = resolveImage('image-normal.png').path

  it('should delete lot image successfully and return deletion status', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_LOT_IMAGE],
    })
    const lotData = await createLot({ sellerId: userData.user.id })
    const imageData = await createImage(IMAGE_PATH)
    const lotImageData = await createLotImage(lotData.lot.id, imageData.image.id)

    const deleteResponse = await deleteLotImageRequest(
      { body: { ids: [imageData.image.id] }, params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    const result = deleteResponse._data

    expect(deleteResponse.status).toBe(200)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(1)
    expect(result[0]?.cause).toBeUndefined()
    expect(result[0]?.ok).toBeTruthy()
    expect(result[0]?.id).toBe(imageData.image.id)

    await lotImageData.clear()
    await imageData.clear()
    await lotData.clear()
    await userData.clear()
  })

  it('should delete lot image successfully and reorder remaining', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_LOT_IMAGE],
    })
    const lotData = await createLot({ sellerId: userData.user.id })

    const imageData1 = await createImage(IMAGE_PATH)
    const lotImageData1 = await createLotImage(lotData.lot.id, imageData1.image.id)

    const imageData2 = await createImage(IMAGE_PATH)
    const lotImageData2 = await createLotImage(lotData.lot.id, imageData2.image.id)

    const imageData3 = await createImage(IMAGE_PATH)
    const lotImageData3 = await createLotImage(lotData.lot.id, imageData3.image.id)

    const deleteResponse = await deleteLotImageRequest(
      { body: { ids: [imageData1.image.id] }, params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    expect(deleteResponse.status).toBe(200)

    await lotImageData2.lotImage.reload()
    await lotImageData3.lotImage.reload()

    expect(lotImageData2.lotImage.order).toBe(0)
    expect(lotImageData3.lotImage.order).toBe(1)

    await lotImageData3.clear()
    await imageData3.clear()
    await lotImageData2.clear()
    await imageData2.clear()
    await lotImageData1.clear()
    await imageData1.clear()
    await lotData.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser()
      const lotData = await createLot({ sellerId: userData.user.id })

      const response = await deleteLotImageRequest(
        { body: { ids: [1] }, params: { id: lotData.lot.id } },
      )

      expect(response.status).toBe(401)
      expect(response._data.data.code).toBe('AUTHENTICATION_REQUIRED')

      await lotData.clear()
      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })
      const lotData = await createLot({ sellerId: userData.user.id })

      const response = await deleteLotImageRequest(
        { body: { ids: [1] }, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.data.code).toBe('FORBIDDEN')

      await lotData.clear()
      await userData.clear()
    })

    it('should return 404 when lot does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_LOT_IMAGE],
      })

      const response = await deleteLotImageRequest(
        { body: { ids: [1] }, params: { id: 93475937459 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)
      expect(response._data.data.code).toBe('LOT_NOT_FOUND')

      await userData.clear()
    })

    it('should return empty array when user is not the lot owner', async () => {
      const user1Data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_LOT_IMAGE],
      })
      const user2Data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_LOT_IMAGE],
      })
      const lot1Data = await createLot({ sellerId: user1Data.user.id })
      const lot2Data = await createLot({ sellerId: user2Data.user.id })
      const imageData = await createImage(IMAGE_PATH)
      const lotImageData = await createLotImage(lot2Data.lot.id, imageData.image.id)

      const deleteResponse = await deleteLotImageRequest(
        { body: { ids: [imageData.image.id] }, params: { id: lot1Data.lot.id } },
        { accessToken: user1Data.access_token },
      )

      const result = deleteResponse._data

      expect(deleteResponse.status).toBe(200)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)

      await lotImageData.clear()
      await imageData.clear()
      await lot1Data.clear()
      await user1Data.clear()
      await user2Data.clear()
    })
  })
})
