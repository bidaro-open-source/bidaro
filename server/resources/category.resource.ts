import type { Category } from '../database'

export interface CategoryResource {
  id: number
  parentId: Category['parentId']
  slug: Category['slug']
  displayName: Category['displayName']
  description: Category['description']
  children: CategoryResource[]
  countLots: number
}

<<<<<<< HEAD
export function createCategoryResource(entity: Category, countLots: number = 0): CategoryResource {
=======
export function createCategoryResource(entity: Category): CategoryResource {
  // Calculate lot count for this category and all its children recursively
  const calculateLotCount = (category: Category): number => {
    // Count lots directly in this category
    const directLots = category.lots?.length ?? 0

    // Count lots in all children recursively
    const childLots = category.children?.reduce((sum, child) => {
      return sum + calculateLotCount(child)
    }, 0) ?? 0

    return directLots + childLots
  }

>>>>>>> 0d3f1a8 (feat: add countLots property to category resources)
  return {
    id: entity.id,
    parentId: entity.parentId,
    slug: entity.slug,
    displayName: entity.displayName,
    description: entity.description,
<<<<<<< HEAD
    children: entity.children ? entity.children.map(child => createCategoryResource(child, 0)) : [],
    countLots,
=======
    children: entity.children ? entity.children.map(createCategoryResource) : [],
    countLots: calculateLotCount(entity),
>>>>>>> 0d3f1a8 (feat: add countLots property to category resources)
  }
}
