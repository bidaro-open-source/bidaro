import type { MultipartConfig } from '~~/test/api-e2e/arrangers/create-multipart-config'
import type { UploadLotImageRequest } from './index.post.request'
import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLot } from '~~/test/api-e2e/arrangers/create-lot'
import { createMultipartConfig } from '~~/test/api-e2e/arrangers/create-multipart-config'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { deleteS3Object } from '~~/test/api-e2e/arrangers/delete-s3-object'
import { resolveImage } from '~~/test/api-e2e/utils/resolve-image'
import { withAuth } from '~~/test/api-e2e/with-auth'

async function uploadLotImageRequest(
  payload: { params: UploadLotImageRequest['params'], multipart: MultipartConfig },
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/images`, {
    method: 'POST',
    body: payload.multipart.body,
    headers: withAuth(options.accessToken, {
      'Content-Type': payload.multipart.contentType,
    }),
  })
}

describe('POST /api/lots/:id/images', async () => {
  await setup({ host: env.SETUP_HOST })

  const IMAGE = 'image-normal.png'
  const IMAGE_TO_BIG = 'image-heavy.png'
  const IMAGE_PNG = 'image-normal.png'
  const IMAGE_JPG = 'image-normal.jpg'
  const IMAGE_JPEG = 'image-normal.jpeg'
  const IMAGE_WEBP = 'image-normal.webp'
  const IMAGE_AVIF = 'image-unsupport.avif'

  describe('valid file uploads', () => {
    it.each([
      IMAGE_PNG,
      IMAGE_JPG,
      IMAGE_JPEG,
      IMAGE_WEBP,
    ])('should upload file "%s"', async (filename: string) => {
      const userData = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: userData.user.id })
      const multipart = createMultipartConfig(resolveImage(filename))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      const image = await response.json()

      expect(response.status).toBe(200)
      expect(image.id).toBeDefined()
      expect(image.key).toBeDefined()
      expect(image.bucket).toBeDefined()
      expect(image.mime).toBeDefined()

      await deleteS3Object(image.bucket, image.key)
      await (db.Image.destroy({ where: { id: image.id } }))
      await lotData.clear()
      await userData.clear()
    })
  })

  describe('invalid file uploads', () => {
    it.each([
      IMAGE_TO_BIG,
      IMAGE_AVIF,
    ])('should upload file "%s"', async (filename: string) => {
      const userData = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: userData.user.id })
      const multipart = createMultipartConfig(resolveImage(filename))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(422)

      await lotData.clear()
      await userData.clear()
    })
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const multipart = createMultipartConfig(resolveImage(IMAGE))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: 1 } },
      )

      expect(response.status).toBe(401)
    })

    it('should return 404 when lot does not exist', async () => {
      const userData = await createUser({ withSession: true })
      const multipart = createMultipartConfig(resolveImage(IMAGE))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: 945395394 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)

      await userData.clear()
    })

    it('should return 403 when user is not the lot owner', async () => {
      const user1Data = await createUser()
      const user2Data = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: user1Data.user.id })
      const multipart = createMultipartConfig(resolveImage(IMAGE))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: user2Data.access_token },
      )

      expect(response.status).toBe(403)

      await lotData.clear()
      await user1Data.clear()
      await user2Data.clear()
    })
  })
})
