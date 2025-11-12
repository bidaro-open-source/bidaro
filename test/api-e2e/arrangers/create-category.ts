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
  const category = await db.CategoryFactory.new().create({
    parentId: options.parentId,
  })

  const clear = () => category.destroy()

  return { category, clear }
}
