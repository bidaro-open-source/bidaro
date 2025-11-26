import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createPublishedLot } from '~~/test/api-e2e/arrangers/lots/create-published-lot'
import { fetch } from '~~/test/api-e2e/fetch'

async function viewCatalogRequest(query: { page?: number, limit?: number, category_slug?: string } = {}) {
  return await fetch(`/api/catalog`, { method: 'GET', query })
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

    const lot = body.data[0]
    expect(lot.id).toBeDefined()
    expect(lot.title).toBeDefined()
    expect(lot.seller).toBeDefined()

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
    expect(body.data.length).toBe(2)

    const parentLot = body.data.find((lot: { id: number }) => lot.id === lotInParent.lot.id)
    const childLot = body.data.find((lot: { id: number }) => lot.id === lotInChild.lot.id)

    expect(parentLot).toBeDefined()
    expect(parentLot.id).toBeDefined()
    expect(parentLot.title).toBeDefined()
    expect(parentLot.seller).toBeDefined()
    expect(parentLot.category).toBeDefined()

    expect(childLot).toBeDefined()
    expect(childLot.id).toBeDefined()
    expect(childLot.title).toBeDefined()
    expect(childLot.seller).toBeDefined()
    expect(childLot.category).toBeDefined()

    await lotInChild.clear()
    await lotInParent.clear()
    await childCategoryData.clear()
    await parentCategoryData.clear()
    await userData.clear()
  })
})
