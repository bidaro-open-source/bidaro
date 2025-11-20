import type { GetCategoryRequest } from '../index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function getCategoryBreadcrumbsRequest(payload: GetCategoryRequest) {
  return await fetch(`/api/categories/${payload.params.id}/breadcrumbs`, {
    method: 'GET',
  })
}

describe('GET /api/categories/:id/breadcrumbs', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return category breadcrumbs with correct structure', async () => {
    const userData = await createUser()

    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory({
      parentId: categoryData1.category.id,
    })

    for (let i = 0; i < 3; i++) {
      const response = await getCategoryBreadcrumbsRequest(
        { params: { id: categoryData2.category.id } },
      )

      const breadcrumbs = response._data

      expect(response.status).toBe(200)
      expect(Array.isArray(breadcrumbs)).toBeTruthy()
      expect(breadcrumbs.length).toBe(2)
      expect(breadcrumbs[0].id).toBe(categoryData1.category.id)
      expect(breadcrumbs[0].displayName).toBe(categoryData1.category.displayName)
      expect(breadcrumbs[1].id).toBe(categoryData2.category.id)
      expect(breadcrumbs[1].displayName).toBe(categoryData2.category.displayName)
    }

    await categoryData2.clear()
    await categoryData1.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when category does not exist', async () => {
      const userData = await createUser()

      const response = await getCategoryBreadcrumbsRequest(
        { params: { id: 5345345 } },
      )

      expect(response.status).toBe(404)

      await userData.clear()
    })
  })
})
