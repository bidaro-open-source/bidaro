import type { MultipartConfig } from '~~/test/api-e2e/arrangers/create-multipart-config'
import type { UploadLotImageRequest } from '../../../../../../server/api/lots/[id]/images/index.post.request'
import { describe, expect, it } from 'vitest'
import { IMAGE_PER_LOT_LIMIT, permissions } from '~~/server/constants'
import { createMultipartConfig } from '~~/test/api-e2e/arrangers/create-multipart-config'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { deleteS3Object } from '~~/test/api-e2e/arrangers/delete-s3-object'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { resolveImage } from '~~/test/api-e2e/utils/resolve-image'

async function uploadLotImageRequest(
  payload: { params: UploadLotImageRequest['params'], multipart: MultipartConfig },
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/images`, {
    method: 'POST',
    body: payload.multipart.body,
    accessToken: options.accessToken,
    headers: {
      'Content-Type': payload.multipart.contentType,
    },
  })
}

describe('POST /api/lots/:id/images', async () => {
  const IMAGE = 'image-normal.png'
  const IMAGE_TO_BIG = 'image-heavy.png'
  const IMAGE_PNG = 'image-normal.png'
  const IMAGE_JPG = 'image-normal.jpg'
  const IMAGE_JPEG = 'image-normal.jpeg'
  const IMAGE_WEBP = 'image-normal.webp'
  const IMAGE_AVIF = 'image-unsupport.avif'
  const IMAGE_NOT_JPG_IS_PNG = 'image-not-jpg-is-png.jpg'
  const IMAGE_INVALID_DIMENSION_BY_WIDTH = 'image-invalid-dimension-by-width.png'
  const IMAGE_INVALID_DIMENSION_BY_HEIGHT = 'image-invalid-dimension-by-height.png'

  describe('valid file uploads', () => {
    it.each([
      IMAGE_PNG,
      IMAGE_JPG,
      IMAGE_JPEG,
      IMAGE_WEBP,
      IMAGE_NOT_JPG_IS_PNG,
    ])('should upload file "%s"', async (filename: string) => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPLOAD_LOT_IMAGE],
      })
      const lotData = await createLot({ sellerId: userData.user.id })
      const multipart = createMultipartConfig(resolveImage(filename))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      const image = response._data

      expect(response.status).toBe(200)
      expect(image.id).toBeDefined()
      expect(image.key).toBeDefined()
      expect(image.bucket).toBeDefined()
      expect(image.mime).toBeDefined()

      await deleteS3Object(image.bucket, image.key)
      await (db.Image.destroy({ where: { id: image.id } }))
      await lotData.clear()
      await userData.clear()
    }, 15_000)
  })

  describe('invalid file uploads', () => {
    it('return 422 when file is not passed', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPLOAD_LOT_IMAGE],
      })
      const lotData = await createLot({ sellerId: userData.user.id })
      const multipart = createMultipartConfig([])

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(422)
      expect(response._data.data.code).toBe('VALIDATION_ERROR')

      await lotData.clear()
      await userData.clear()
    }, 15_000)

    it('return 413 when file is too heavy', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPLOAD_LOT_IMAGE],
      })
      const lotData = await createLot({ sellerId: userData.user.id })
      const multipart = createMultipartConfig(resolveImage(IMAGE_TO_BIG))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(413)
      expect(response._data.data.code).toBe('PAYLOAD_TOO_LARGE')

      await lotData.clear()
      await userData.clear()
    }, 15_000)

    it('return 415 when file is not allowed type', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPLOAD_LOT_IMAGE],
      })
      const lotData = await createLot({ sellerId: userData.user.id })
      const multipart = createMultipartConfig(resolveImage(IMAGE_AVIF))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(415)
      expect(response._data.data.code).toBe('UNSUPPORTED_MEDIA_TYPE')

      await lotData.clear()
      await userData.clear()
    }, 15_000)

    it('return 422 when file width too big', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPLOAD_LOT_IMAGE],
      })
      const lotData = await createLot({ sellerId: userData.user.id })
      const multipart = createMultipartConfig(resolveImage(IMAGE_INVALID_DIMENSION_BY_WIDTH))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(422)
      expect(response._data.data.code).toBe('VALIDATION_ERROR')

      await lotData.clear()
      await userData.clear()
    }, 15_000)

    it('return 422 when file height too big', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPLOAD_LOT_IMAGE],
      })
      const lotData = await createLot({ sellerId: userData.user.id })
      const multipart = createMultipartConfig(resolveImage(IMAGE_INVALID_DIMENSION_BY_HEIGHT))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(422)
      expect(response._data.data.code).toBe('VALIDATION_ERROR')

      await lotData.clear()
      await userData.clear()
    }, 15_000)
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const multipart = createMultipartConfig(resolveImage(IMAGE))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: 1 } },
      )

      expect(response.status).toBe(401)
      expect(response._data.data.code).toBe('AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })
      const lotData = await createLot({ sellerId: userData.user.id })
      const multipart = createMultipartConfig(resolveImage(IMAGE))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
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
        withPermissions: [permissions.UPLOAD_LOT_IMAGE],
      })
      const multipart = createMultipartConfig(resolveImage(IMAGE))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: 93475937459 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)
      expect(response._data.data.code).toBe('LOT_NOT_FOUND')

      await userData.clear()
    })

    it('should return 403 when user is not the lot owner', async () => {
      const user1Data = await createUser()
      const user2Data = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPLOAD_LOT_IMAGE],
      })
      const lotData = await createLot({ sellerId: user1Data.user.id })
      const multipart = createMultipartConfig(resolveImage(IMAGE))

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: user2Data.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.data.code).toBe('FORBIDDEN')

      await lotData.clear()
      await user1Data.clear()
      await user2Data.clear()
    })

    it('should return 400 when the image upload limit for a lot is reached', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPLOAD_LOT_IMAGE],
      })
      const lotData = await createLot({ sellerId: userData.user.id })
      const multipart = createMultipartConfig(resolveImage(IMAGE))

      const images = []

      for (let i = 0; i < IMAGE_PER_LOT_LIMIT; i++) {
        const response = await uploadLotImageRequest(
          { multipart, params: { id: lotData.lot.id } },
          { accessToken: userData.access_token },
        )

        expect(response.status).toBe(200)

        images.push(response._data)
      }

      const response = await uploadLotImageRequest(
        { multipart, params: { id: lotData.lot.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(400)
      expect(response._data.data.code).toBe('LOT_IMAGE_LIMIT_REACHED')

      for (const image of images) {
        await deleteS3Object(image.bucket, image.key)
        await (db.Image.destroy({ where: { id: image.id } }))
      }

      await lotData.clear()
      await userData.clear()
    })
  }, 15_000)
})
