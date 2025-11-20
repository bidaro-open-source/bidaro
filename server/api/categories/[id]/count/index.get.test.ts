import type { GetCategoryRequest } from '../index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function getCategoryCountRequest(
  payload: GetCategoryRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/categories/${payload.params.id}/count`, {
    method: 'GET',
    accessToken: options.accessToken,
  })
}

describe('GET /api/categories/:id/count', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return count of lots', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.VIEW_CATEGORY_COUNT],
    })

    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory({
      parentId: categoryData1.category.id,
    })

    const lotData1 = await createLot({
      sellerId: userData.user.id,
      categoryId: categoryData1.category.id,
    })

    const lotData2 = await createLot({
      sellerId: userData.user.id,
      categoryId: categoryData2.category.id,
    })

    const response1 = await getCategoryCountRequest(
      { params: { id: categoryData1.category.id } },
      { accessToken: userData.access_token },
    )

    expect(response1.status).toBe(200)
    expect(response1._data).toBe(2)

    const response2 = await getCategoryCountRequest(
      { params: { id: categoryData2.category.id } },
      { accessToken: userData.access_token },
    )

    expect(response2.status).toBe(200)
    expect(response2._data).toBe(1)

    await lotData2.clear()
    await lotData1.clear()
    await categoryData2.clear()
    await categoryData1.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when category does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.VIEW_CATEGORY_COUNT],
      })

      const response = await getCategoryCountRequest(
        { params: { id: 5345345 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
      const categoryData = await createCategory()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await getCategoryCountRequest(
        { params: { id: categoryData.category.id } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)

      await categoryData.clear()
      await userData.clear()
    })
  })
})
