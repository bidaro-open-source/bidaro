import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'

async function getCategoriesRequest() {
  return await fetch(`/api/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('get root categories', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return correct structure', async () => {
    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory({
      parentId: categoryData1.category.id,
    })

    const response = await getCategoriesRequest()

    const categories = await response.json()

    expect(response.status).toBe(200)

    expect(Array.isArray(categories)).toBeTruthy()

    expect(categories[0].id).toBeDefined()
    expect(categories[0].slug).toBeDefined()
    expect(categories[0].displayName).toBeDefined()
    expect(categories[0].description).toBeDefined()
    expect(categories[0].parentId).toBeDefined()
    expect(categories[0].children).toBeDefined()
    expect(typeof categories[0].countLots).toBe('number')

    await categoryData2.clear()
    await categoryData1.clear()
  })
})
