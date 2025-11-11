import type { MultipartFetch } from '~~/test/api-e2e/utils/create-multipart-fetch'
import type { GetLotRequest } from '../index.request'
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

function getMultipart(filename: string, mime: string) {
  const filePath = path.resolve(__dirname, `./__fixtures__/${filename}`)

  return createMultipartFetch([{
    path: filePath,
    filename,
    mime,
  }])
}

describe('get images', async () => {
  await setup()

  const filePath = 'image-normal.png'
  const fileMime = 'image/png'

  it('should get uploaded image and return correct structure', async () => {
    const userData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: userData.user.id })
    const multipart = getMultipart(filePath, fileMime)

    await uploadLotImageRequest(
      { multipart, params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    const getResponse = await getLotImageRequest(
      { params: { id: lotData.lot.id } },
    )

    const result = await getResponse.json()

    expect(getResponse.status).toBe(200)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(1)
    expect(result[0]?.id).toBeDefined()
    expect(result[0]?.key).toBeDefined()
    expect(result[0]?.bucket).toBeDefined()
    expect(result[0]?.mime).toBeDefined()

    await lotData.clear()
    await userData.clear()
  })

  it('should get uploaded images with correct order', async () => {
    const userData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: userData.user.id })
    const multipart = getMultipart(filePath, fileMime)

    const imageResponse1 = await uploadLotImageRequest(
      { multipart, params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )
    const image1 = await imageResponse1.json()

    const imageResponse2 = await uploadLotImageRequest(
      { multipart, params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )
    const image2 = await imageResponse2.json()

    const getResponse = await getLotImageRequest(
      { params: { id: lotData.lot.id } },
    )

    const result = await getResponse.json()

    expect(getResponse.status).toBe(200)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2)
    expect(result[0]?.id).toBe(image1.id)
    expect(result[1]?.id).toBe(image2.id)

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
