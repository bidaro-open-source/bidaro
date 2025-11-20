import type { UpdateCategoryRequest } from './index.patch.request'
import { env } from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'

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
  await setup({ host: env.SETUP_HOST })

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

      expect(response.status).toBe(401)

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
          params: { id: 5345345 },
        },
        { accessToken: userData.access_token },
      )

      expect(response.status).toBe(404)

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

      expect(response.status).toBe(403)

      await categoryData.clear()
      await userData.clear()
    })
  })
})
