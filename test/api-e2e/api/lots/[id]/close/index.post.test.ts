import type { ViewLotRequest } from '../../../../../../server/api/lots/[id]/index.request'
import { describe, expect, it } from 'vitest'
import { lotStatuses, permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { createPublishedLot } from '~~/test/api-e2e/arrangers/lots/create-published-lot'
import { createReadyForClosingLot } from '~~/test/api-e2e/arrangers/lots/create-ready-for-closing-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../../utils/expect-error'


async function closeLotRequest(
  payload: ViewLotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/close`, {
    method: 'POST',
    accessToken: options.accessToken,
  })
}

describe('POST /api/lots/:id/close', async () => {
  it('should close lot successfully with reject', async () => {
    const uData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CLOSE_LOT],
    })
    const cData = await createCategory()
    const lotData = await createReadyForClosingLot({
      sellerId: uData.user.id,
      categoryId: cData.category.id,
    })

    const response = await closeLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    const lot = response._data

    expect(response.status).toBe(200)
    expect(lot.statusName).toBe(lotStatuses.REJECTED)
    expect(lot.winner).toBeNull()

    await lotData.clear()
    await cData.clear()
    await uData.clear()
  })

  it('should close lot successfully with winner', async () => {
    const uData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CLOSE_LOT],
    })
    const uuData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CLOSE_LOT],
    })
    const cData = await createCategory()
    const lotData = await createReadyForClosingLot({
      sellerId: uData.user.id,
      categoryId: cData.category.id,
      winnerId: uuData.user.id,
    })

    const response = await closeLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    const lot = response._data

    expect(response.status).toBe(200)
    expect(lot.winnerId).toBe(uuData.user.id)
    expect(lot.statusName).toBe(lotStatuses.IN_DISCUSSION_PROCESS)

    await lotData.clear()
    await uuData.clear()
    await cData.clear()
    await uData.clear()
  })

  it('should close lot successfully with winner and send mail', async () => {
    const uData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CLOSE_LOT],
    })
    const uuData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CLOSE_LOT],
    })
    const cData = await createCategory()
    const lotData = await createReadyForClosingLot({
      sellerId: uData.user.id,
      categoryId: cData.category.id,
      winnerId: uuData.user.id,
    })

    await closeLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    const messages1 = await mailhog.getMessagesByEmail(uData.user.email)
    const content1 = messages1[0].Content.Body.replace(/=[\r\n]+/g, '')
    const escapedEmail1 = uuData.user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex1 = new RegExp(escapedEmail1)
    const match1 = content1.match(regex1)
    const foundEmail1 = match1 ? match1[0] : null

    expect(foundEmail1).toBe(uuData.user.email)

    const messages2 = await mailhog.getMessagesByEmail(uuData.user.email)
    const content2 = messages2[0].Content.Body.replace(/=[\r\n]+/g, '')
    const escapedEmail2 = uData.user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex2 = new RegExp(escapedEmail2)
    const match2 = content2.match(regex2)
    const foundEmail2 = match2 ? match2[0] : null

    expect(foundEmail2).toBe(uData.user.email)

    await lotData.clear()
    await uuData.clear()
    await cData.clear()
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CLOSE_LOT],
      })
      const cData = await createCategory()
      const lotData = await createReadyForClosingLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const response = await closeLotRequest(
        { params: { id: lotData.lot.id } },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })
      const cData = await createCategory()
      const lotData = await createReadyForClosingLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const response = await closeLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })

    it('should return 403 when the lot is alien', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CLOSE_LOT],
      })
      const cData = await createCategory()
      const lotData = await createReadyForClosingLot({
        sellerId: uData1.user.id,
        categoryId: cData.category.id,
      })

      const response = await closeLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData2.access_token },
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
        withPermissions: [permissions.CLOSE_LOT],
      })

      const response = await closeLotRequest(
        { params: { id: 93475937459 } },
        { accessToken: uData.access_token },
      )

      expectApiError(response, 'LOT_NOT_FOUND')

      await uData.clear()
    })

    it('should return 400 when the lot is not in the process of bidding', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CLOSE_LOT],
      })
      const cData = await createCategory()
      const lotData = await createLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const response = await closeLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expectApiError(response, 'LOT_INVALID_STATUS')

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })

    it('should return 400 when time has not yet passed', async () => {
      const uData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CLOSE_LOT],
      })
      const cData = await createCategory()
      const lotData = await createPublishedLot({
        sellerId: uData.user.id,
        categoryId: cData.category.id,
      })

      const response = await closeLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expectApiError(response, 'BAD_REQUEST')

      await lotData.clear()
      await cData.clear()
      await uData.clear()
    })
  })
})
