import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

async function getCategoriesRequest() {
  return await fetch(`/api/categories`, { method: 'GET' })
}

describe('GET /api/categories', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return categories with correct structure', async () => {
    const userData = await createUser()
    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory({
      parentId: categoryData1.category.id,
    })

    for (let i = 0; i < 3; i++) {
      const response = await getCategoriesRequest()

      const categories = response._data

      expect(response.status).toBe(200)

      expect(Array.isArray(categories)).toBeTruthy()

      expect(categories[0].id).toBeDefined()
      expect(categories[0].slug).toBeDefined()
      expect(categories[0].path).toBeDefined()
      expect(categories[0].displayName).toBeDefined()
      expect(categories[0].description).toBeDefined()
      expect(categories[0].parentId).toBeDefined()
    }

    await categoryData2.clear()
    await categoryData1.clear()
    await userData.clear()
  })
})
