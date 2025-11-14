import type { Category } from '~~/server/database'

interface Options {
  parentId?: number
}

/**
 * Creates new category in database.
 *
 * @param options category options
 * @returns category instance with clear function
 */
export async function createCategory(options: Options = {}) {
  const category = await db.CategoryFactory.new().create()

  let parentCategory: Category | null = null

  if (options.parentId) {
    parentCategory = await db.Category.findOne({ where: { id: options.parentId } })

    if (!parentCategory) {
      throw new Error('Parent category not found')
    }

    category.parentId = parentCategory.id
  }

  category.path = parentCategory
    ? `${parentCategory.path}/${category.id}`
    : `${category.id}`

  await category.save()

  const clear = () => category.destroy()

  return { category, clear }
}
