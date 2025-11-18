import type { GetCategoryRequest } from './index.get.request'
import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createLot } from '~~/test/api-e2e/arrangers/create-lot'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'

async function getCategoryRequest(payload: GetCategoryRequest) {
  return await fetch(`/api/categories/${payload.params.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('GET /api/categories/:id - Retrieve Category with Children and Lot Counts', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return category with children and aggregated lot counts', async () => {
    const userData = await createUser()
    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory({
      parentId: categoryData1.category.id,
    })

    const lotData1 = await createLot({
      ownerId: userData.user.id,
      categoryId: categoryData1.category.id,
    })

    const lotData2 = await createLot({
      ownerId: userData.user.id,
      categoryId: categoryData2.category.id,
    })

    const response = await getCategoryRequest(
      { params: { id: categoryData1.category.id } },
    )

    const category = await response.json()

    expect(response.status).toBe(200)
    expect(category.id).toBe(categoryData1.category.id)
    expect(category.slug).toBe(categoryData1.category.slug)
    expect(category.displayName).toBe(categoryData1.category.displayName)
    expect(category.description).toBe(categoryData1.category.description)
    expect(category.parentId).toBe(categoryData1.category.parentId)
    expect(typeof category.countLots).toBe('number')
    expect(category.countLots).toBe(2)

    expect(Array.isArray(category.children)).toBeTruthy()
    expect(category.children.length).toBe(1)

    expect(category.children[0]?.id).toBe(categoryData2.category.id)
    expect(category.children[0]?.slug).toBe(categoryData2.category.slug)
    expect(category.children[0]?.displayName).toBe(categoryData2.category.displayName)
    expect(category.children[0]?.description).toBe(categoryData2.category.description)
    expect(category.children[0]?.parentId).toBe(categoryData2.category.parentId)
    expect(typeof category.children[0]?.countLots).toBe('number')
    expect(category.children[0].countLots).toBe(1)

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
