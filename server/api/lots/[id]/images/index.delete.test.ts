import type { MultipartFetch } from '~~/test/api-e2e/utils/create-multipart-fetch'
import type { DeleteLotImageRequest } from './index.delete.request'
import type { UploadLotImageRequest } from './index.post.request'
import * as path from 'node:path'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLot } from '~~/test/api-e2e/utils/create-lot'
import { createMultipartFetch } from '~~/test/api-e2e/utils/create-multipart-fetch'
import { createUser } from '~~/test/api-e2e/utils/create-user'

import { withAuth } from '~~/test/api-e2e/with-auth'
import '~~/test/api-e2e/setup-redis'
import '~~/test/api-e2e/setup-database'
import '~~/test/api-e2e/setup-object-storage'

async function uploadLotImageRequest(
  payload: { params: UploadLotImageRequest['params'], multipart: MultipartFetch },
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

async function deleteLotImageRequest(
  payload: DeleteLotImageRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/images`, {
    method: 'DELETE',
    body: JSON.stringify(payload.body),
    headers: withAuth(options.accessToken, {
      'Content-Type': 'application/json',
    }),
  })
}

function getMultipart(filename: string, mime: string) {
  const filePath = path.resolve(__dirname, `./__fixtures__/${filename}`)

  return createMultipartFetch([{
    path: filePath,
    filename,
    mime,
  }])
}

describe('create draft lot', async () => {
  await setup()

  const filePath = 'image-normal.png'
  const fileMime = 'image/png'

  it('should delete uploaded file and return correct structure', async () => {
    const userData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: userData.user.id })
    const multipart = getMultipart(filePath, fileMime)

    const uploadResponse = await uploadLotImageRequest(
      { multipart, params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    const image = await uploadResponse.json()

    const deleteResponse = await deleteLotImageRequest(
      { body: { ids: [image.id] }, params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    const result = await deleteResponse.json()

    expect(deleteResponse.status).toBe(200)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(1)
    expect(result[0]?.cause).toBeUndefined()
    expect(result[0]?.ok).toBeTruthy()
    expect(result[0]?.id).toBe(image.id)

    await lotData.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 for anonymus', async () => {
      const response = await deleteLotImageRequest(
        { body: { ids: [1] }, params: { id: 1 } },
      )

      expect(response.status).toBe(401)
    })

    it('should return 404', async () => {
      const userData = await createUser({ withSession: true })

      const response = await deleteLotImageRequest(
        { body: { ids: [1] }, params: { id: 945395394 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)

      await userData.clear()
    })

    it('should return empty array when user is not owner', async () => {
      const user1Data = await createUser({ withSession: true })
      const user2Data = await createUser({ withSession: true })
      const lot1Data = await createLot({ ownerId: user1Data.user.id })
      const lot2Data = await createLot({ ownerId: user2Data.user.id })
      const multipart = getMultipart('image-normal.png', 'image/png')

      const uploadResponse = await uploadLotImageRequest(
        { multipart, params: { id: lot2Data.lot.id } },
        { accessToken: user2Data.access_token },
      )
      const image = await uploadResponse.json()

      const deleteResponse = await deleteLotImageRequest(
        { body: { ids: [image.id] }, params: { id: lot1Data.lot.id } },
        { accessToken: user1Data.access_token },
      )

      const result = await deleteResponse.json()

      expect(deleteResponse.status).toBe(200)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)

      await lot1Data.clear()
      await user1Data.clear()
      await user2Data.clear()
    })
  })
})
