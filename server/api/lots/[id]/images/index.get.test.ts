import type { GetLotRequest } from '../index.request'
import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createImage } from '~~/test/api-e2e/arrangers/create-image'
import { createLot } from '~~/test/api-e2e/arrangers/create-lot'
import { createLotImage } from '~~/test/api-e2e/arrangers/create-lot-image'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { resolveImage } from '~~/test/api-e2e/utils/resolve-image'
import { withAuth } from '~~/test/api-e2e/with-auth'

async function getLotImageRequest(
  payload: GetLotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/images`, {
    method: 'GET',
    headers: withAuth(options.accessToken, {
      'Content-Type': 'application/json',
    }),
  })
}

describe('get images', async () => {
  await setup({ host: env.SETUP_HOST })

  const IMAGE_PATH = resolveImage('image-normal.png').path

  it('should get uploaded image and return correct structure', async () => {
    const userData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: userData.user.id })
    const imageData = await createImage(IMAGE_PATH)
    const lotImageData = await createLotImage(lotData.lot.id, imageData.image.id)

    const getResponse = await getLotImageRequest(
      { params: { id: lotData.lot.id } },
    )

    const result = await getResponse.json()

    expect(getResponse.status).toBe(200)
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

  it('should get uploaded images with correct order', async () => {
    const userData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: userData.user.id })

    const imageData1 = await createImage(IMAGE_PATH)
    const lotImageData1 = await createLotImage(lotData.lot.id, imageData1.image.id)

    const imageData2 = await createImage(IMAGE_PATH)
    const lotImageData2 = await createLotImage(lotData.lot.id, imageData2.image.id)

    const getResponse = await getLotImageRequest(
      { params: { id: lotData.lot.id } },
    )

    const result = await getResponse.json()

    expect(getResponse.status).toBe(200)
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
    it('should return 404', async () => {
      const userData = await createUser({ withSession: true })

      const response = await getLotImageRequest(
        { params: { id: 945395394 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)

      await userData.clear()
    })
  })
})
