import type { ViewCategoryRequest } from '../../../../../server/api/categories/[id]/index.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { createLot } from '~~/test/api-e2e/arrangers/lots/create-lot'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../utils/expect-error'


async function deleteCategoryRequest(
  payload: ViewCategoryRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/categories/${payload.params.id}`, {
    method: 'DELETE',
    accessToken: options.accessToken,
  })
}

describe('DELETE /api/categories/:id', async () => {
  it('should delete category successfully', async () => {
    const categoryData = await createCategory()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.DELETE_CATEGORY],
    })

    const response = await deleteCategoryRequest(
      { params: { id: categoryData.category.id } },
      { accessToken: userData.access_token },
    )

    expect(response.status).toBe(204)

    await categoryData.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const categoryData = await createCategory()

      const response = await deleteCategoryRequest(
        { params: { id: categoryData.category.id } },
      )

      expectApiError(response, 'AUTHENTICATION_REQUIRED')

      await categoryData.clear()
    })

    it('should return 404 when category does not exist', async () => {
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_CATEGORY],
      })

      const response = await deleteCategoryRequest(
        { params: { id: 5345345 } },
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

      const response = await deleteCategoryRequest(
        { params: { id: categoryData.category.id } },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await categoryData.clear()
      await userData.clear()
    })

    it('should return 400 when category has child categories', async () => {
      const categoryData1 = await createCategory()
      const categoryData2 = await createCategory({
        parentId: categoryData1.category.id,
      })

      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_CATEGORY],
      })

      const response = await deleteCategoryRequest(
        { params: { id: categoryData1.category.id } },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'CATEGORY_HAS_CHILDREN')

      await categoryData2.clear()
      await categoryData1.clear()
      await userData.clear()
    })

    it('should return 400 when category has associated lots', async () => {
      const categoryData = await createCategory()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.DELETE_CATEGORY],
      })
      const lotData = await createLot({
        sellerId: userData.user.id,
        categoryId: categoryData.category.id,
      })

      const response = await deleteCategoryRequest(
        { params: { id: categoryData.category.id } },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'CATEGORY_HAS_LOTS')

      await lotData.clear()
      await categoryData.clear()
      await userData.clear()
    })
  })
})
