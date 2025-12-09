import type { CreateCategoryRequest } from '../../../../server/api/categories/index.post.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../utils/expect-error'


async function createCategoryRequest(
  payload: CreateCategoryRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/categories`, {
    method: 'POST',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

async function destroyCategory(id: number) {
  return await db.Category.destroy({ where: { id } })
}

describe('POST /api/categories', async () => {
  it('should create root category successfully', async () => {
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

    const category = response._data

    expect(response.status).toBe(201)
    expect(category.id).toBeDefined()
    expect(category.slug).toBe(slug)
    expect(category.path).toBe(`${category.id}`)
    expect(category.displayName).toBe(displayName)
    expect(category.description).toBe(null)
    expect(category.parentId).toBe(null)

    await destroyCategory(category.id)
    await userData.clear()
  })

  it('should create child category successfully with parent relationship', async () => {
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

    const category = response._data

    expect(response.status).toBe(201)
    expect(category.path).toBe(`${categoryData.category.path}/${category.id}`)
    expect(category.parentId).toBe(categoryData.category.id)

    await destroyCategory(category.id)
    await categoryData.clear()
    await userData.clear()
  })

  describe('valid slug format handling', () => {
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
      'should accept and normalize slug: "%s"',
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

        const category = response._data

        expect(response.status).toBe(201)

        await destroyCategory(category.id)
        await userData.clear()
      },
    )
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { slug, displayName } = db.CategoryFactory.new().make()

      const response = await createCategoryRequest(
        { body: { slug, displayName } },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')
    })

    it('should return 403 when user lacks required permission', async () => {
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

      expectApiError(response, 'FORBIDDEN')

      await userData.clear()
    })

    it('should return 422 when slug is already in use', async () => {
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

      expectApiError(response, 'CATEGORY_SLUG_TAKEN')

      await categoryData.clear()
      await userData.clear()
    })

    it('should return 422 when parent category does not exist', async () => {
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

      expectApiError(response, 'PARENT_CATEGORY_NOT_FOUND')

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
    ])('should return 422 for invalid slug format: "%s"', async (slug: any) => {
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

      expectApiError(response, 'VALIDATION_ERROR')

      await userData.clear()
    })
  })
})
