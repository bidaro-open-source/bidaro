import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createLot } from '~~/test/api-e2e/arrangers/create-lot'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'

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

  it('should return correct lot counts', async () => {
    const userData = await createUser()
    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory({
      parentId: categoryData1.category.id,
    })

    const lotData1 = await createLot({
      ownerId: userData.user.id,
    })
    await lotData1.lot.update({ categoryId: categoryData1.category.id })

    const lotData2 = await createLot({
      ownerId: userData.user.id,
    })
    await lotData2.lot.update({ categoryId: categoryData2.category.id })

    const response = await getCategoriesRequest()
    const categories = await response.json()

    expect(response.status).toBe(200)

    const parentCategory = categories.find((c: any) => c.id === categoryData1.category.id)
    expect(parentCategory).toBeDefined()
    expect(parentCategory.countLots).toBe(2)

    await lotData2.clear()
    await lotData1.clear()
    await categoryData2.clear()
    await categoryData1.clear()
    await userData.clear()
  })
})
