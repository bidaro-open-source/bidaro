import type { CreateCategoryRequest } from './index.post.request'
import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { withAuth } from '~~/test/api-e2e/with-auth'

async function createCategoryRequest(
  payload: CreateCategoryRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/categories`, {
    method: 'POST',
    body: JSON.stringify(payload.body),
    headers: withAuth(options.accessToken, {
      'Content-Type': 'application/json',
    }),
  })
}

async function destoryCategory(id: number) {
  return await db.Category.destroy({ where: { id } })
}

describe('create category', async () => {
  await setup({ host: env.SETUP_HOST })

  it('should create a category and return correct structure', async () => {
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CREATE_CATEGORY],
    })

    const { slug, displayName } = db.CategoryFactory.new().make()

    const response = await createCategoryRequest(
      { body: { slug, displayName } },
      { accessToken: userData.access_token },
    )

    const category = await response.json()

    expect(response.status).toBe(201)
    expect(category.id).toBeDefined()
    expect(category.slug).toBe(slug)
    expect(category.path).toBe(`${category.id}`)
    expect(category.displayName).toBe(displayName)
    expect(category.description).toBe(null)
    expect(category.parentId).toBe(null)

    await destoryCategory(category.id)
    await userData.clear()
  })

  it('should create a category with parent category', async () => {
    const categoryData = await createCategory()

    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.CREATE_CATEGORY],
    })

    const { slug, displayName } = db.CategoryFactory.new().make()

    const response = await createCategoryRequest(
      { body: { slug, displayName, parentId: categoryData.category.id } },
      { accessToken: userData.access_token },
    )

    const category = await response.json()

    expect(response.status).toBe(201)
    expect(category.path).toBe(`${categoryData.category.path}/${category.id}`)
    expect(category.parentId).toBe(categoryData.category.id)

    await destoryCategory(category.id)
    await categoryData.clear()
    await userData.clear()
  })

  describe('should create with correct slug', () => {
    it.each([
      'my-new-product',
      'product-123',
      '123-product',
      'kategoriya',
      'abc',
      'a-b',
      'product-with-many-hyphens-like-this',
      'a'.repeat(128),
      'n0v1y-t0var-s-c1fram1',
      '  with-spaces-around  ',
      'WILL-BE-LOWERCASED',
      '  Combined-Test-123  ',
    ])(
      '"%s"',
      async (slug: string) => {
        const userData = await createUser({
          withRole: true,
          withSession: true,
          withPermissions: [permissions.CREATE_CATEGORY],
        })

        const { displayName } = db.CategoryFactory.new().make()

        const response = await createCategoryRequest(
          { body: { slug, displayName } },
          { accessToken: userData.access_token },
        )

        const category = await response.json()

        expect(response.status).toBe(201)

        await destoryCategory(category.id)
        await userData.clear()
      },
    )
  })

  describe('error handling', () => {
    it('should return 401 for anonymus', async () => {
      const { slug, displayName } = db.CategoryFactory.new().make()

      const response = await createCategoryRequest(
        { body: { slug, displayName } },
      )

      expect(response.status).toBe(401)
    })

    it('should return 403 when user have not permission', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const { slug, displayName } = db.CategoryFactory.new().make()

      const response = await createCategoryRequest(
        { body: { slug, displayName } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)

      await userData.clear()
    })

    it('should return 422 when slug already taken', async () => {
      const categoryData = await createCategory()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CREATE_CATEGORY],
      })

      const slug = categoryData.category.slug
      const displayName = categoryData.category.displayName

      const response = await createCategoryRequest(
        { body: { slug, displayName } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(422)

      await categoryData.clear()
      await userData.clear()
    })

    it('should return 422 when parent not found', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CREATE_CATEGORY],
      })

      const { slug, displayName } = db.CategoryFactory.new().make()

      const response = await createCategoryRequest(
        { body: { slug, displayName, parentId: 93475937459 } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(422)

      await userData.clear()
    })

    it.each([
      '',
      'ab',
      'a'.repeat(129),
      '-start-with-dash',
      'end-with-dash-',
      'with--double-dash',
      '-',
      'with space',
      'with_underscore',
      'special/char',
      'special.dot',
      'мой-продукт',
      'product(copy)',
      12345,
      null,
      undefined,
      true,
    ])('should return 422 when slug is "%s"', async (slug: any) => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.CREATE_CATEGORY],
      })

      const { displayName } = db.CategoryFactory.new().make()

      const response = await createCategoryRequest(
        { body: { slug, displayName } },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(422)

      await userData.clear()
    })
  })
})
