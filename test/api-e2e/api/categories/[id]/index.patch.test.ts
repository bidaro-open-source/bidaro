import type { UpdateCategoryRequest } from '../../../../../server/api/categories/[id]/index.patch.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../utils/expect-error'


async function updateCategoryRequest(
  payload: UpdateCategoryRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/categories/${payload.params.id}`, {
    method: 'PATCH',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PATCH /api/categories/:id', async () => {
  describe('should update a category', () => {
    it.each([
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

        const updatedCategory = response._data

        expect(response.status).toBe(200)
        expect(updatedCategory[key]).toBe(value)

        await categoryData.clear()
        await userData.clear()
      },
    )

    it('by key "description" with empty value', async () => {
      const categoryData = await createCategory({ description: 'initial description' })
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_CATEGORY],
      })

      const response = await updateCategoryRequest(
        {
          body: { description: '' },
          params: { id: categoryData.category.id },
        },
        { accessToken: userData.access_token },
      )

      const updatedCategory = response._data

      expect(response.status).toBe(200)
      expect(updatedCategory.description).toBe(null)

      await categoryData.clear()
      await userData.clear()
    })
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const categoryData = await createCategory()

      const response = await updateCategoryRequest(
        {
          body: { displayName: 'new value' },
          params: { id: categoryData.category.id },
        },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')

      await categoryData.clear()
    })

    it('should return 404 when category does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_CATEGORY],
      })

      const response = await updateCategoryRequest(
        {
          body: { displayName: 'new value' },
          params: { id: 93475937459 },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'CATEGORY_NOT_FOUND')

      await userData.clear()
    })

    it('should return 403 when user lacks required permission', async () => {
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

      expectApiError(response, 'FORBIDDEN')

      await categoryData.clear()
      await userData.clear()
    })
  })
})
