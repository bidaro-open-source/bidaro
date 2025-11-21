import type { GetLotRequest } from './index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function getLotRequest(payload: GetLotRequest) {
  return await fetch(`/api/lots/${payload.params.id}`, {
    method: 'GET',
  })
}

describe('GET /api/lots/:id', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should retrieve lot with correct structure', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLot({ sellerId: uData.user.id })

    const response = await getLotRequest({ params: { id: lotData.lot.id } })

    const lot = response._data

    expect(response.status).toBe(200)
    expect(lot).toHaveProperty('id')
    expect(lot).toHaveProperty('seller')
    expect(lot).toHaveProperty('seller.id')
    expect(lot).toHaveProperty('seller.username')
    expect(lot).toHaveProperty('winner')
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

  describe('error handling', () => {
    it('should return 404 when lot does not exist', async () => {
      const response = await getLotRequest(
        { params: { id: 93475937459 } },
      )

      expect(response.status).toBe(404)
    })
  })
})
