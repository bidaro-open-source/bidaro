import type { ViewLotRequest } from '../../../../../../server/api/lots/[id]/index.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createImage } from '~~/test/api-e2e/arrangers/create-image'
import { createLotImage } from '~~/test/api-e2e/arrangers/create-lot-image'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { resolveImage } from '~~/test/api-e2e/utils/resolve-image'

async function viewLotImageRequest(
  payload: ViewLotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/images`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/lots/:id/images', async () => {
  const IMAGE_PATH = resolveImage('image-normal.png').path

  it('should retrieve lot image with correct structure and metadata', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_LOT_IMAGES],
    })
    const lotData = await createLot({ sellerId: userData.user.id })
    const imageData = await createImage(IMAGE_PATH)
    const lotImageData = await createLotImage(lotData.lot.id, imageData.image.id)

    const response = await viewLotImageRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    const result = response._data

    expect(response.status).toBe(200)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(1)
    expect(result[0]?.id).toBe(imageData.image.id)
    expect(result[0]?.key).toBe(imageData.image.key)
    expect(result[0]?.bucket).toBe(imageData.image.bucket)
    expect(result[0]?.mime).toBe(imageData.image.mime_type)

    await lotImageData.clear()
    await imageData.clear()
    await lotData.clear()
    await userData.clear()
  })

  it('should retrieve lot images in correct order', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_LOT_IMAGES],
    })
    const lotData = await createLot({ sellerId: userData.user.id })

    const imageData1 = await createImage(IMAGE_PATH)
    const lotImageData1 = await createLotImage(lotData.lot.id, imageData1.image.id)

    const imageData2 = await createImage(IMAGE_PATH)
    const lotImageData2 = await createLotImage(lotData.lot.id, imageData2.image.id)

    const response = await viewLotImageRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    const result = response._data

    expect(response.status).toBe(200)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2)
    expect(result[0]?.id).toBe(imageData1.image.id)
    expect(result[1]?.id).toBe(imageData2.image.id)

    await lotImageData2.clear()
    await imageData2.clear()
    await lotImageData1.clear()
    await imageData1.clear()
    await lotData.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.VIEW_LOT_IMAGES],
      })
      const lotData = await createLot({ sellerId: userData.user.id })

      const response = await viewLotImageRequest(
        { params: { id: lotData.lot.id } },
      )

      expect(response.status).toBe(401)
      expect(response._data.code).toBe('AUTHENTICATION_REQUIRED')

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

      const response = await viewLotImageRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.code).toBe('FORBIDDEN')

      await lotData.clear()
      await userData.clear()
    })

    it('should return 404 when lot does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.VIEW_LOT_IMAGES],
      })

      const response = await viewLotImageRequest(
        { params: { id: 93475937459 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)
      expect(response._data.code).toBe('NOT_FOUND')

      await userData.clear()
    })
  })
})
