import type { UpdateCategorySlugRequest } from '../../../../../../server/api/categories/[id]/slug/index.put.request'
import { v4 as uuidv4 } from 'uuid'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../../utils/expect-error'


async function updateCategoryRequest(
  payload: UpdateCategorySlugRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/categories/${payload.params.id}/slug`, {
    method: 'PUT',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PUT /api/categories/:id/slug', async () => {
  it('should update category slug successfully', async () => {
    const categoryData = await createCategory()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_CATEGORY_SLUG],
    })

    const slug = uuidv4()

    const response = await updateCategoryRequest(
      {
        body: { slug },
        params: { id: categoryData.category.id },
      },
      { accessToken: userData.access_token },
    )

    const updatedCategory = response._data

    expect(response.status).toBe(200)
    expect(updatedCategory.slug).toBe(slug)

    await categoryData.clear()
    await userData.clear()
  })

  it('should not update category slug with same slug', async () => {
    const categoryData = await createCategory()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_CATEGORY_SLUG],
    })

    const response = await updateCategoryRequest(
      {
        body: { slug: categoryData.category.slug },
        params: { id: categoryData.category.id },
      },
      { accessToken: userData.access_token },
    )

    const updatedCategory = response._data

    expect(response.status).toBe(200)
    expect(updatedCategory.slug).toBe(categoryData.category.slug)

    await categoryData.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const categoryData = await createCategory()

      const response = await updateCategoryRequest(
        {
          body: { slug: uuidv4() },
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
        withPermissions: [permissions.UPDATE_CATEGORY_SLUG],
      })

      const response = await updateCategoryRequest(
        {
          body: { slug: uuidv4() },
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
          body: { slug: uuidv4() },
          params: { id: categoryData.category.id },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await categoryData.clear()
      await userData.clear()
    })

    it('should return 422 when slug is already in use by another category', async () => {
      const categoryData1 = await createCategory()
      const categoryData2 = await createCategory()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_CATEGORY_SLUG],
      })

      const response = await updateCategoryRequest(
        {
          body: { slug: categoryData2.category.slug },
          params: { id: categoryData1.category.id },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'CATEGORY_SLUG_TAKEN')

      await categoryData2.clear()
      await categoryData1.clear()
      await userData.clear()
    })
  })
})
