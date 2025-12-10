import { describe, expect, it } from 'vitest'
import { actionLimits, permissions } from '~~/server/constants'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../utils/expect-api-error'

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
  it('should create draft lot successfully for authenticated user', async () => {
    const data = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CREATE_LOT],
    })

    const response = await createLotRequest(
      { accessToken: data.access_token },
    )

    const lot = response._data

    expect(response.status).toBe(201)
    expect(lot.id).toBeDefined()
    expect(lot.title).toBeDefined()
    expect(lot.initialPrice).toBeDefined()
    expect(lot.initialDuration).toBeDefined()
    expect(lot.statusName).toBeDefined()

    await destroyLot(lot.id)
    await data.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await createLotRequest()

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await createLotRequest(
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await userData.clear()
    })

    it('should return 429 when the user has exceeded the daily limit', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CREATE_LOT],
      })

      const lotIds: number[] = []

      for (let i = 0; i < actionLimits.CREATE_LOT; i++) {
        const response = await createLotRequest({ accessToken: userData.access_token })

        expect(response.status).toBe(201)

        lotIds.push(response._data.id)
      }

      const response = await createLotRequest({ accessToken: userData.access_token })

      expect(response.status).toBe(429)

      for (const id of lotIds) {
        await destroyLot(id)
      }

      await userData.clear()
    })
  })
})
