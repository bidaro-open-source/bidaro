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

  return {
    id: entity.id,
    parentId: entity.parentId,
    slug: entity.slug,
    displayName: entity.displayName,
    description: entity.description,
    children: entity.children ? entity.children.map(createCategoryResource) : [],
    countLots: calculateLotCount(entity),
  }
}
