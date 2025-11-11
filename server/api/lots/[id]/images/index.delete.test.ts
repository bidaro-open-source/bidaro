import type { DeleteLotImageRequest } from './index.delete.request'
import * as path from 'node:path'
import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createImage } from '~~/test/api-e2e/arrangers/create-image'
import { createLot } from '~~/test/api-e2e/arrangers/create-lot'
import { createLotImage } from '~~/test/api-e2e/arrangers/create-lot-image'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'

import { withAuth } from '~~/test/api-e2e/with-auth'
import '~~/test/api-e2e/setup-redis'
import '~~/test/api-e2e/setup-database'
import '~~/test/api-e2e/setup-object-storage'

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

describe('create draft lot', async () => {
  await setup({ host: env.SETUP_HOST })

  const filePath = path.resolve(__dirname, '__fixtures__', 'image-normal.png')

  it('should delete uploaded file and return correct structure', async () => {
    const userData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: userData.user.id })
    const imageData = await createImage(filePath)
    const lotImageData = await createLotImage(lotData.lot.id, imageData.image.id)

    const deleteResponse = await deleteLotImageRequest(
      { body: { ids: [imageData.image.id] }, params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    const result = await deleteResponse.json()

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

  describe('error handling', () => {
    it('should return 401 for anonymus', async () => {
      const userData = await createUser()
      const lotData = await createLot({ ownerId: userData.user.id })

      const response = await deleteLotImageRequest(
        { body: { ids: [1] }, params: { id: lotData.lot.id } },
      )

      expect(response.status).toBe(401)

      await lotData.clear()
      await userData.clear()
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
      const imageData = await createImage(filePath)
      const lotImageData = await createLotImage(lot2Data.lot.id, imageData.image.id)

      const deleteResponse = await deleteLotImageRequest(
        { body: { ids: [imageData.image.id] }, params: { id: lot1Data.lot.id } },
        { accessToken: user1Data.access_token },
      )

      const result = await deleteResponse.json()

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
