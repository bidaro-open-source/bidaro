import type { ViewLotRequest } from '../../../../../server/api/lots/[id]/index.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
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
  it('should delete lot successfully and return deletion status', async () => {
    const uData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_LOT],
    })
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
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_LOT],
      })
      const lotData = await createLot({ sellerId: uData.user.id })

      const response = await deleteLotRequest(
        { params: { id: lotData.lot.id } },
      )

      expect(response.status).toBe(401)
      expect(response._data.data.code).toBe('AUTHENTICATION_REQUIRED')

      await lotData.clear()
      await uData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })
      const lotData = await createLot({ sellerId: uData.user.id })

      const response = await deleteLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(403)
      expect(response._data.data.code).toBe('FORBIDDEN')

      await lotData.clear()
      await uData.clear()
    })

    it('should return 403 when the lot is alien', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_LOT],
      })
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
      expect(response._data.data.code).toBe('FORBIDDEN')

      await lotData.clear()
      await cData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 404 when lot does not exist', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_LOT],
      })

      const response = await deleteLotRequest(
        { params: { id: 93475937459 } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(404)
      expect(response._data.data.code).toBe('LOT_NOT_FOUND')

      await uData.clear()
    })

    it('should return 400 when the lot is publish', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_LOT],
      })
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
      expect(response._data.data.code).toBe('LOT_INVALID_STATUS')

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })
  })
})
