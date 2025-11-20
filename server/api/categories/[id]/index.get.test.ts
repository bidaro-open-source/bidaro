import type { GetCategoryRequest } from './index.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function getCategoryRequest(payload: GetCategoryRequest) {
  return await fetch(`/api/categories/${payload.params.id}`, { method: 'GET' })
}

describe('GET /api/categories/:id', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return category with children and aggregated lot counts', async () => {
    const userData = await createUser()
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

    const response = await getCategoryRequest(
      { params: { id: categoryData1.category.id } },
    )

    const category = response._data

    expect(response.status).toBe(200)
    expect(category.id).toBe(categoryData1.category.id)
    expect(category.slug).toBe(categoryData1.category.slug)
    expect(category.path).toBe(categoryData1.category.path)
    expect(category.displayName).toBe(categoryData1.category.displayName)
    expect(category.description).toBe(categoryData1.category.description)
    expect(category.parentId).toBe(categoryData1.category.parentId)

    expect(Array.isArray(category.children)).toBeTruthy()
    expect(category.children.length).toBe(1)

    expect(category.children[0]?.id).toBe(categoryData2.category.id)
    expect(category.children[0]?.slug).toBe(categoryData2.category.slug)
    expect(category.children[0]?.path).toBe(categoryData2.category.path)
    expect(category.children[0]?.displayName).toBe(categoryData2.category.displayName)
    expect(category.children[0]?.description).toBe(categoryData2.category.description)
    expect(category.children[0]?.parentId).toBe(categoryData2.category.parentId)

    await lotData2.clear()
    await lotData1.clear()
    await categoryData2.clear()
    await categoryData1.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 404 when category does not exist', async () => {
      const response = await getCategoryRequest(
        { params: { id: 5345345 } },
      )

      expect(response.status).toBe(404)
    })
  })
})
