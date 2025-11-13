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

export function createCategoryResource(entity: Category, countLots: number = 0): CategoryResource {
  return {
    id: entity.id,
    parentId: entity.parentId,
    slug: entity.slug,
    displayName: entity.displayName,
    description: entity.description,
    children: entity.children ? entity.children.map(child => createCategoryResource(child, 0)) : [],
    countLots,
  }
}
