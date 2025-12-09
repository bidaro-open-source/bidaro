import type { ViewLotRequest } from '../../../../../../server/api/lots/[id]/index.request'
import { describe, expect, it } from 'vitest'
import { lotStatuses, permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createShippedLot } from '~~/test/api-e2e/arrangers/lots/create-shipped-lot'
import { createWinnerLot } from '~~/test/api-e2e/arrangers/lots/create-winner-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../../utils/expect-api-error'

async function receiveLotRequest(
  payload: ViewLotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/receive`, {
    method: 'POST',
    accessToken: options.accessToken,
  })
}

describe('POST /api/lots/:id/receive', async () => {
  it('should ship lot successfully', async () => {
    const uData = await createUser()
    const uuData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.RECEIVE_LOT],
    })
    const cData = await createCategory()
    const lotData = await createShippedLot({
      sellerId: uData.user.id,
      winnerId: uuData.user.id,
      categoryId: cData.category.id,
    })

    const response = await receiveLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uuData.access_token },
    )

    const lot = response._data

    expect(response.status).toBe(200)
    expect(lot.statusName).toBe(lotStatuses.RECEIVED)

    await lotData.clear()
    await cData.clear()
    await uuData.clear()
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const uData = await createUser()
      const uuData = await createUser()
      const cData = await createCategory()
      const lotData = await createWinnerLot({
        sellerId: uData.user.id,
        winnerId: uuData.user.id,
        categoryId: cData.category.id,
      })

      const response = await receiveLotRequest(
        { params: { id: lotData.lot.id } },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')

      await lotData.clear()
      await cData.clear()
      await uuData.clear()
      await uData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const uData = await createUser()
      const uuData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })
      const cData = await createCategory()
      const lotData = await createShippedLot({
        sellerId: uData.user.id,
        winnerId: uuData.user.id,
        categoryId: cData.category.id,
      })

      const response = await receiveLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uuData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await lotData.clear()
      await cData.clear()
      await uuData.clear()
      await uData.clear()
    })

    it('should return 403 when the lot is alien', async () => {
      const uData1 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.RECEIVE_LOT],
      })
      const uData2 = await createUser()
      const cData = await createCategory()
      const lotData = await createWinnerLot({
        sellerId: uData1.user.id,
        winnerId: uData2.user.id,
        categoryId: cData.category.id,
      })

      const response = await receiveLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData1.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await lotData.clear()
      await cData.clear()
      await uData2.clear()
      await uData1.clear()
    })

    it('should return 404 when lot does not exist', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.RECEIVE_LOT],
      })

      const response = await receiveLotRequest(
        { params: { id: 93475937459 } },
        { accessToken: uData.access_token },
      )

      expectApiError(response, 'LOT_NOT_FOUND')

      await uData.clear()
    })

    it('should return 400 when the lot is not in the process of delivery', async () => {
      const uData = await createUser()
      const uuData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.RECEIVE_LOT],
      })
      const cData = await createCategory()
      const lotData = await createWinnerLot({
        sellerId: uData.user.id,
        winnerId: uuData.user.id,
        categoryId: cData.category.id,
      })

      const response = await receiveLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uuData.access_token },
      )

      expectApiError(response, 'LOT_INVALID_STATUS')

      await lotData.clear()
      await cData.clear()
      await uuData.clear()
      await uData.clear()
    })
  })
})
