import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createLot } from '~~/test/utils/creations/create-lot'
import { createLotPublished } from '~~/test/utils/creations/create-lot-published'
import { createUser } from '~~/test/utils/creations/create-user'
import { deleteLotRequest } from '~~/test/utils/requests/lots'

describe('delete /api/lots/:id', async () => {
  await setup()

  it('should delete the lot', async () => {
    const uData = await createUser({ withSession: true })
    const lotData = await createLot({ ownerId: uData.user.id })

    const response = await deleteLotRequest(
      { params: { id: lotData.lot.id } },
      { accessToken: uData.access_token },
    )

    expect(response.status).toBe(200)

    await uData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when a lot is not exists', async () => {
      const uData = await createUser({ withSession: true })

      const response = await deleteLotRequest(
        { params: { id: 123456 } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(404)
    })

    it('should return 400 when the lot is publish', async () => {
      const uData = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData.user.id })

      const response = await deleteLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData.access_token },
      )

      expect(response.status).toBe(400)

      await lotData.clear()
      await uData.clear()
    })

    it('should return 404 when the lot is alien', async () => {
      const uData1 = await createUser()
      const uData2 = await createUser({ withSession: true })
      const lotData = await createLotPublished({ ownerId: uData1.user.id })

      const response = await deleteLotRequest(
        { params: { id: lotData.lot.id } },
        { accessToken: uData2.access_token },
      )

      expect(response.status).toBe(404)

      await lotData.clear()
      await uData2.clear()
      await uData1.clear()
    })
  })
})
