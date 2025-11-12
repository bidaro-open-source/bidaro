import type { Category } from '../database'

export interface CategoryResource {
  id: number
  parentId: Category['parentId']
  slug: Category['slug']
  displayName: Category['displayName']
  description: Category['description']
  children: CategoryResource[]
}

export function createCategoryResource(entity: Category): CategoryResource {
  return {
    id: entity.id,
    parentId: entity.parentId,
    slug: entity.slug,
    displayName: entity.displayName,
    description: entity.description,
    children: entity.children ? entity.children.map(createCategoryResource) : [],
  }
}
