import type { UpdateCategoryParentRequest } from '../../../../../../server/api/categories/[id]/parent/index.put.request'
import { describe, expect, it } from 'vitest'
import { permissions } from '~~/server/constants'
import { createCategory } from '~~/test/api-e2e/arrangers/create-category'
import { createUser } from '~~/test/api-e2e/arrangers/create-user'
import { fetch } from '~~/test/api-e2e/fetch'
import { expectApiError } from '../../../../utils/expect-error'


async function updateCategoryParentRequest(
  payload: UpdateCategoryParentRequest,
  options: { accessToken?: string } = {},
) {
  return await fetch(`/api/categories/${payload.params.id}/parent`, {
    method: 'PUT',
    body: payload.body,
    accessToken: options.accessToken,
  })
}

describe('PUT /api/categories/:id/parent', async () => {
  it('should update a category parent successfully', async () => {
    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory()
    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_CATEGORY_PARENT],
    })

    const response = await updateCategoryParentRequest(
      {
        body: { parentId: categoryData2.category.id },
        params: { id: categoryData1.category.id },
      },
      { accessToken: userData.access_token },
    )

    const updatedCategory = response._data

    expect(response.status).toBe(200)
    expect(updatedCategory.parentId).toBe(categoryData2.category.id)

    await categoryData1.clear()
    await categoryData2.clear()
    await userData.clear()
  })

  it('should update category path when parent changes', async () => {
    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory({ parentId: categoryData1.category.id })

    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_CATEGORY_PARENT],
    })

    const response = await updateCategoryParentRequest(
      {
        body: { parentId: null },
        params: { id: categoryData2.category.id },
      },
      { accessToken: userData.access_token },
    )

    const updatedCategory = response._data

    expect(response.status).toBe(200)
    expect(updatedCategory.path).toBe(`${categoryData2.category.id}`)

    await categoryData2.clear()
    await categoryData1.clear()
    await userData.clear()
  })

  it('should cascade path updates to all child categories', async () => {
    const categoryData1 = await createCategory()
    const categoryData2 = await createCategory({ parentId: categoryData1.category.id })
    const categoryData3 = await createCategory({ parentId: categoryData2.category.id })
    const categoryData4 = await createCategory({ parentId: categoryData3.category.id })

    const userData = await createUser({
      withRole: true,
      withSession: true,
      withPermissions: [permissions.UPDATE_CATEGORY_PARENT],
    })

    const response = await updateCategoryParentRequest(
      {
        body: { parentId: categoryData1.category.id },
        params: { id: categoryData3.category.id },
      },
      { accessToken: userData.access_token },
    )

    await categoryData3.category.reload()
    await categoryData4.category.reload()

    expect(response.status).toBe(200)
    expect(categoryData3.category.path).toBe(
      `${categoryData1.category.id}/${categoryData3.category.id}`,
    )
    expect(categoryData4.category.path).toBe(
      `${categoryData1.category.id}/${categoryData3.category.id}/${categoryData4.category.id}`,
    )

    await categoryData4.clear()
    await categoryData3.clear()
    await categoryData2.clear()
    await categoryData1.clear()
    await userData.clear()
  })

  describe('error handling', () => {
    it('should return 401 when user is not authenticated', async () => {
      const categoryData = await createCategory()

      const response = await updateCategoryParentRequest(
        {
          body: { parentId: null },
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
        withPermissions: [permissions.UPDATE_CATEGORY_PARENT],
      })

      const response = await updateCategoryParentRequest(
        {
          body: { parentId: null },
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

      const response = await updateCategoryParentRequest(
        {
          body: { parentId: null },
          params: { id: categoryData.category.id },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'FORBIDDEN')

      await categoryData.clear()
      await userData.clear()
    })

    it('should return 422 when parent category does not exist', async () => {
      const categoryData = await createCategory()
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_CATEGORY_PARENT],
      })

      const response = await updateCategoryParentRequest(
        {
          body: { parentId: 93475937459 },
          params: { id: categoryData.category.id },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'PARENT_CATEGORY_NOT_FOUND')

      await categoryData.clear()
      await userData.clear()
    })

    it('should return 422 when attempting to set child as parent (circular reference)', async () => {
      const categoryData1 = await createCategory()
      const categoryData2 = await createCategory({ parentId: categoryData1.category.id })
      const categoryData3 = await createCategory({ parentId: categoryData2.category.id })
      const userData = await createUser({
        withRole: true,
        withSession: true,
        withPermissions: [permissions.UPDATE_CATEGORY_PARENT],
      })

      const response = await updateCategoryParentRequest(
        {
          body: { parentId: categoryData3.category.id },
          params: { id: categoryData1.category.id },
        },
        { accessToken: userData.access_token },
      )

      expectApiError(response, 'CATEGORY_PARENT_LOOP')

      await categoryData3.clear()
      await categoryData2.clear()
      await categoryData1.clear()
      await userData.clear()
    })
  })
})
