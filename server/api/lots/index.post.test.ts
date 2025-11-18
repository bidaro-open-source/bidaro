import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function createLotRequest(
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/lots`, {
    method: 'POST',
    accessToken: options.accessToken,
  })
}

export async function destroyLot(id: number) {
  return (await db.Lot.findByPk(id))!.destroy()
}

describe('POST /api/lots', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should create draft lot successfully for authenticated user', async () => {
    const data = await createUser({ withSession: true })

    const response = await createLotRequest(
      { accessToken: data.access_token },
    )

    const lot = response._data

    expect(response.status).toBe(201)
    expect(lot.id).toBeDefined()
    expect(lot.title).toBeDefined()
    expect(lot.initialAmount).toBeDefined()
    expect(lot.initialDuration).toBeDefined()
    expect(lot.statusName).toBeDefined()

    await destroyLot(lot.id)
    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await createLotRequest()

      expect(response.status).toBe(401)
    })
  })
})
