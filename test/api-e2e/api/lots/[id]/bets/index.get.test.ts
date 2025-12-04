import type { ViewLotRequest } from '../../../../../../server/api/lots/[id]/index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createWinnerLot } from '~~/test/api-e2e/arrangers/lots/create-winner-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewLotBetsRequest(
  payload: ViewLotRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots/${payload.params.id}/bets`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/lots/:id/bets', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should retrieve bets with correct structure', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_USERS],
    })

    const winnerData = await createUser()
    const categoryData = await createCategory()
    const lotData = await createWinnerLot({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
      winnerId: winnerData.user.id,
    })

    const response = await viewLotBetsRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: userData.access_token },
    )

    const bets = Array.isArray(response._data) ? response._data : []

    expect(response.status).toBe(200)

    expect(bets[0]).toHaveProperty('id')
    expect(bets[0]).toHaveProperty('amount')
    expect(bets[0]).toHaveProperty('user')
    expect(bets[0]).toHaveProperty('user.username')
    expect(bets[0].user.username).not.toBe(winnerData.user.username)

    await lotData.clear()
    await categoryData.clear()
    await winnerData.clear()
    await userData.clear()
  })
})
