import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { lotStatuses } from '~~/server/constants'
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

  it('should not display lots with non-trading statuses', async () => {
    const userData = await createUser()
    const categoryData = await createCategory()

    const publishedLot = await createPublishedLot({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
    })

    const draftLot = await db.LotFactory.new().create({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
      statusName: lotStatuses.DRAFT,
      initialPrice: db.LotFactory.initialPrice,
      initialDuration: db.LotFactory.initialDuration,
    })

    const discussionLot = await db.LotFactory.new().create({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
      statusName: lotStatuses.IN_DISCUSSION_PROCESS,
      initialPrice: db.LotFactory.initialPrice,
      currentPrice: db.LotFactory.initialPrice,
      initialDuration: db.LotFactory.initialDuration,
      effectiveDate: new Date(),
      expirationDate: new Date(Date.now() - 1000),
    })

    const deliveryLot = await db.LotFactory.new().create({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
      statusName: lotStatuses.IN_DELIVERY_PROCESS,
      initialPrice: db.LotFactory.initialPrice,
      currentPrice: db.LotFactory.initialPrice,
      initialDuration: db.LotFactory.initialDuration,
      effectiveDate: new Date(),
      expirationDate: new Date(Date.now() - 1000),
    })

    const receivedLot = await db.LotFactory.new().create({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
      statusName: lotStatuses.RECEIVED,
      initialPrice: db.LotFactory.initialPrice,
      currentPrice: db.LotFactory.initialPrice,
      initialDuration: db.LotFactory.initialDuration,
      effectiveDate: new Date(),
      expirationDate: new Date(Date.now() - 1000),
    })

    const rejectedLot = await db.LotFactory.new().create({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
      statusName: lotStatuses.REJECTED,
      initialPrice: db.LotFactory.initialPrice,
      currentPrice: db.LotFactory.initialPrice,
      initialDuration: db.LotFactory.initialDuration,
      effectiveDate: new Date(),
      expirationDate: new Date(Date.now() - 1000),
    })

    const response = await viewCatalogRequest()

    expect(response.status).toBe(200)

    const body = response._data
    const lotIds = body.data.map((lot: { id: number }) => lot.id)

    expect(lotIds).toContain(publishedLot.lot.id)
    expect(lotIds).not.toContain(draftLot.id)
    expect(lotIds).not.toContain(discussionLot.id)
    expect(lotIds).not.toContain(deliveryLot.id)
    expect(lotIds).not.toContain(receivedLot.id)
    expect(lotIds).not.toContain(rejectedLot.id)

    await rejectedLot.destroy()
    await receivedLot.destroy()
    await deliveryLot.destroy()
    await discussionLot.destroy()
    await draftLot.destroy()
    await publishedLot.clear()
    await categoryData.clear()
    await userData.clear()
  })

  it('should not display in_trading lots with expired time', async () => {
    const userData = await createUser()
    const categoryData = await createCategory()

    const activeLot = await createPublishedLot({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
    })

    const expiredLot = await db.LotFactory.new().create({
      sellerId: userData.user.id,
      categoryId: categoryData.category.id,
      statusName: lotStatuses.IN_TRADING_PROCESS,
      initialPrice: db.LotFactory.initialPrice,
      currentPrice: db.LotFactory.initialPrice,
      initialDuration: db.LotFactory.initialDuration,
      effectiveDate: new Date(Date.now() - 2000),
      expirationDate: new Date(Date.now() - 1000),
    })

    const response = await viewCatalogRequest()

    expect(response.status).toBe(200)

    const body = response._data
    const lotIds = body.data.map((lot: { id: number }) => lot.id)

    expect(lotIds).toContain(activeLot.lot.id)
    expect(lotIds).not.toContain(expiredLot.id)

    await expiredLot.destroy()
    await activeLot.clear()
    await categoryData.clear()
    await userData.clear()
  })
})
