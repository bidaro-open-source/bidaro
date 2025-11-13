import type { UpdateCategoryRequest } from './index.patch.request'
import { env } from 'node:process'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { withAuth } from '~~/test/api-e2e/with-auth'

async function updateCategoryRequest(
  payload: UpdateCategoryRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/categories/${payload.params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload.body),
    headers: withAuth(options.accessToken, {
      'Content-Type': 'application/json',
    }),
  })
}

describe('update category', async () => {
  await setup({ host: env.SETUP_HOST })

  describe('should update a category', () => {
    it.each([
      ['slug', 'updated-slug'],
      ['displayName', 'updated display name'],
      ['description', 'updated description'],
    ])(
      'by key "%s" with value "%s"',
      async (key: string, value: string) => {
        const categoryData = await createCategory()
        const userData = await createUser({
          withRole: true,
          withSession: true,
          withPermissions: [permissions.UPDATE_CATEGORY],
        })

        const response = await updateCategoryRequest(
          { body: { [key]: value }, params: { id: categoryData.category.id } },
          { accessToken: userData.access_token },
        )

        const updatedCategory = await response.json()

        expect(response.status).toBe(200)
        expect(updatedCategory[key]).toBe(value)

        await categoryData.clear()
        await userData.clear()
      },
    )

    it('by key "paretnId"', async () => {
      const categoryData1 = await createCategory()
      const categoryData2 = await createCategory()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_CATEGORY],
      })

      const response = await updateCategoryRequest(
        {
          body: { parentId: categoryData2.category.id },
          params: { id: categoryData1.category.id },
        },
        { accessToken: userData.access_token },
      )

      const updatedCategory = await response.json()

      expect(response.status).toBe(200)
      expect(updatedCategory.parentId).toBe(categoryData2.category.id)

      await categoryData1.clear()
      await categoryData2.clear()
      await userData.clear()
    })
  })

  describe('error handling', () => {
    it('should return 401 for anonymus', async () => {
      const categoryData = await createCategory()

      const response = await updateCategoryRequest(
        {
          body: { displayName: 'new value' },
          params: { id: categoryData.category.id },
        },
      )

      expect(response.status).toBe(401)

      await categoryData.clear()
    })

    it('should return 404 when category not exists', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_CATEGORY],
      })

      const response = await updateCategoryRequest(
        {
          body: { displayName: 'new value' },
          params: { id: 5345345 },
        },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)

      await userData.clear()
    })

    it('should return 403 when user have not permission', async () => {
      const categoryData = await createCategory()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [],
      })

      const response = await updateCategoryRequest(
        {
          body: { displayName: 'new value' },
          params: { id: categoryData.category.id },
        },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(403)

      await categoryData.clear()
      await userData.clear()
    })

    it('should return 422 when slug already exists', async () => {
      const categoryData1 = await createCategory()
      const categoryData2 = await createCategory()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_CATEGORY],
      })

      const response = await updateCategoryRequest(
        {
          body: { slug: categoryData2.category.slug },
          params: { id: categoryData1.category.id },
        },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(422)

      await categoryData2.clear()
      await categoryData1.clear()
      await userData.clear()
    })
  })
})
