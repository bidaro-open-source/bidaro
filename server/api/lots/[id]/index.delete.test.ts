import type { ViewLotRequest } from './index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { createPublishedLot } from '~~/test/api-e2e/arrangers/lots/create-published-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function deleteLotRequest(
  payload: ViewLotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}`, {
    method: 'DELETE',
    accessToken: options.accessToken,
  })
}

describe('DELETE /api/lots/:id', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should delete lot successfully and return deletion status', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLot({ sellerId: uData.user.id })

    const response = await deleteLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    expect(response.status).toBe(204)

    await lotData.clear()
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLot({ sellerId: uData.user.id })

      const response = await deleteLotRequest(
        { params: { id: lotData.lot.id } },
      )

      expect(response.status).toBe(401)

      await lotData.clear()
      await uData.clear()
    })

    it('should return 403 when the lot is alien', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createPublishedLot({
        sellerId: uData1.user.id,
        categoryId: cData.category.id,
      })

      const response = await deleteLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(403)

      await lotData.clear()
      await cData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 404 when lot does not exist', async () => {
      const uData = await createUser({ withSession: true })

      const response = await deleteLotRequest(
        { params: { id: 93475937459 } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(404)

      await uData.clear()
    })

    it('should return 400 when the lot is publish', async () => {
      const uData = await createUser({ withSession: true })
      const cData = await createCategory()
      const lotData = await createPublishedLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const response = await deleteLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })
  })
})
