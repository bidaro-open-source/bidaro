import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createPublishedLot } from '~~/test/api-e2e/arrangers/lots/create-published-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewCatalogRequest(params: { page?: number, limit?: number, category_slug?: string } = {}) {
  const searchParams = new URLSearchParams()
  if (params.page)
    searchParams.set('page', String(params.page))
  if (params.limit)
    searchParams.set('limit', String(params.limit))
  if (params.category_slug)
    searchParams.set('category_slug', params.category_slug)

  const query = searchParams.toString()
  return await fetch(`/api/catalog${query ? `?${query}` : ''}`, { method: 'GET' })
}

describe('GET /api/catalog', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should return catalog with correct structure', async () => {
    const userData = await createUser()
    const categoryData = await createCategory()
    const lotData = await createPublishedLot({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
    })

    const response = await viewCatalogRequest()

    expect(response.status).toBe(200)

    const body = response._data

    expect(body.data).toBeDefined()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.meta).toBeDefined()
    expect(body.meta.totalItems).toBeDefined()
    expect(body.meta.currentPage).toBeDefined()
    expect(body.meta.itemsPerPage).toBeDefined()

    if (body.data.length > 0) {
      const lot = body.data[0]
      expect(lot.id).toBeDefined()
      expect(lot.title).toBeDefined()
      expect(lot.seller).toBeDefined()
    }

    await lotData.clear()
    await categoryData.clear()
    await userData.clear()
  })

  it('should return lots filtered by category and subcategories', async () => {
    const userData = await createUser()
    const parentCategoryData = await createCategory()
    const childCategoryData = await createCategory({
      parentId: parentCategoryData.category.id,
    })

    const lotInParent = await createPublishedLot({
      sellerId: userData.user.id,
      categoryId: parentCategoryData.category.id,
    })

    const lotInChild = await createPublishedLot({
      sellerId: userData.user.id,
      categoryId: childCategoryData.category.id,
    })

    const response = await viewCatalogRequest({
      category_slug: parentCategoryData.category.slug,
    })

    expect(response.status).toBe(200)

    const body = response._data
    expect(body.data.length).toBeGreaterThanOrEqual(2)

    await lotInChild.clear()
    await lotInParent.clear()
    await childCategoryData.clear()
    await parentCategoryData.clear()
    await userData.clear()
  })

  it('should cache results by limit and page keys', async () => {
    const userData = await createUser()
    const categoryData = await createCategory()
    const lotData = await createPublishedLot({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
    })

    const response1 = await viewCatalogRequest({ limit: 10, page: 1 })
    const response2 = await viewCatalogRequest({ limit: 10, page: 1 })
    const response3 = await viewCatalogRequest({ limit: 20, page: 1 })

    expect(response1.status).toBe(200)
    expect(response2.status).toBe(200)
    expect(response3.status).toBe(200)

    expect(response1._data.meta.itemsPerPage).toBe(10)
    expect(response2._data.meta.itemsPerPage).toBe(10)
    expect(response3._data.meta.itemsPerPage).toBe(20)

    await lotData.clear()
    await categoryData.clear()
    await userData.clear()
  })
})
