import type { MultipartConfig } from '~~/test/api-e2e/arrangers/create-multipart-fetch-payload'
import type { UploadLotImageRequest } from './index.post.request'
import * as path from 'node:path'
import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLot } from '~~/test/api-e2e/arrangers/create-lot'
import { createMultipartConfig } from '~~/test/api-e2e/arrangers/create-multipart-fetch-payload'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { deleteS3Object } from '~~/test/api-e2e/arrangers/delete-s3-object'

import { withAuth } from '~~/test/api-e2e/with-auth'
import '~~/test/api-e2e/setup-redis'
import '~~/test/api-e2e/setup-database'
import '~~/test/api-e2e/setup-object-storage'

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

function getMultipart(filename: string, mime: string) {
  const filePath = path.resolve(__dirname, `./__fixtures__/${filename}`)

  return createMultipartConfig([{
    path: filePath,
    filename,
    mime,
  }])
}

describe('create draft lot', async () => {
  await setup({ host: env.SETUP_HOST })

  describe('uploading correct files', () => {
    it.each([
      ['image-normal.png', 'image/png'],
      ['image-normal.jpg', 'image/jpg'],
      ['image-normal.jpeg', 'image/jpeg'],
      ['image-normal.webp', 'image/webp'],
    ])('should upload file "%s"', async (path: string, mime: string) => {
      const userData = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: userData.user.id })
      const multipart = getMultipart(path, mime)

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

  describe('uploading uncorrect files', () => {
    it.each([
      ['image-heavy.png', 'image/png'],
      ['image-unsupport.avif', 'image/avif'],
    ])('should upload file "%s"', async (path: string, mime: string) => {
      const userData = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: userData.user.id })
      const multipart = getMultipart(path, mime)

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
    it('should return 401 for anonymus', async () => {
      const multipart = getMultipart('image-normal.png', 'image/png')

      const response = await uploadLotImageRequest(
        { multipart, params: { id: 1 } },
      )

      expect(response.status).toBe(401)
    })

    it('should return 404', async () => {
      const userData = await createUser({ withSession: true })
      const multipart = getMultipart('image-normal.png', 'image/png')

      const response = await uploadLotImageRequest(
        { multipart, params: { id: 945395394 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)

      await userData.clear()
    })

    it('should return 403 when user is not owner', async () => {
      const user1Data = await createUser()
      const user2Data = await createUser({ withSession: true })
      const lotData = await createLot({ ownerId: user1Data.user.id })
      const multipart = getMultipart('image-normal.png', 'image/png')

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
