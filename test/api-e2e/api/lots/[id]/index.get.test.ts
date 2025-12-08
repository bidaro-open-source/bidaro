import type { ViewLotRequest } from '../../../../../server/api/lots/[id]/index.request'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createImage } from '~~/test/api-e2e/arrangers/create-image'
import { createLotImage } from '~~/test/api-e2e/arrangers/create-lot-image'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { createWinnerLot } from '~~/test/api-e2e/arrangers/lots/create-winner-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { resolveImage } from '~~/test/api-e2e/utils/resolve-image'

async function viewLotRequest(payload: ViewLotRequest) {
  return await fetch(`/api/lots/${payload.params.id}`, {
    method: 'GET',
  })
}

describe('GET /api/lots/:id', async () => {
  it('should retrieve lot with correct structure', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLot({ sellerId: uData.user.id })

    const response = await viewLotRequest({ params: { id: lotData.lot.id } })

    const lot = response._data

    expect(response.status).toBe(200)
    expect(lot).toHaveProperty('id')
    expect(lot).toHaveProperty('seller')
    expect(lot).toHaveProperty('seller.id')
    expect(lot).toHaveProperty('seller.username')
    expect(lot).toHaveProperty('title')
    expect(lot).toHaveProperty('initialPrice')
    expect(lot).toHaveProperty('currentPrice')
    expect(lot).toHaveProperty('effectiveDate')
    expect(lot).toHaveProperty('expirationDate')
    expect(lot).toHaveProperty('initialDuration')
    expect(lot).toHaveProperty('statusName')

    await lotData.clear()
    await uData.clear()
  })

  it('should retrieve published lot with correct structure', async () => {
    const uData = await createUser({ withSession: true })

    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory({ parentId: categoryData1.category.id })
    const winnerData = await createUser()
    const sellerData = await createUser()

    const lotData = await createWinnerLot({
      sellerId: sellerData.user.id,
      winnerId: winnerData.user.id,
      categoryId: categoryData2.category.id,
    })

    const imageData = await createImage(resolveImage('image-normal.png').path)
    const lotImageData = await createLotImage(lotData.lot.id, imageData.image.id)

    for (let i = 0; i < 3; i++) {
      const response = await viewLotRequest({ params: { id: lotData.lot.id } })

      const lot = response._data

      expect(response.status).toBe(200)

      const lotWinner = lot.winner || {}
      expect(lotWinner.id).toBe(winnerData.user.id)

      const lotCategory = lot.category || {}
      expect(lotCategory.id).toBe(categoryData2.category.id)

      const lotImages = lot.images || []
      expect(lotImages[0]?.id).toBe(imageData.image.id)
      expect(lotImages[0]?.key).toBe(imageData.image.key)
      expect(lotImages[0]?.bucket).toBe(imageData.image.bucket)
      expect(lotImages[0]?.mime).toBe(imageData.image.mime_type)
    }

    await lotImageData.clear()
    await imageData.clear()
    await lotData.clear()
    await categoryData2.clear()
    await categoryData1.clear()
    await winnerData.clear()
    await sellerData.clear()
    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when lot does not exist', async () => {
      const response = await viewLotRequest(
        { params: { id: 93475937459 } },
      )

      expect(response.status).toBe(404)
      expect(response._data.data.code).toBe('LOT_NOT_FOUND')
    })
  })
})
