import type { CategoryAttributes } from '../../database'

export type CategoryResource = ReturnType<typeof createCategoryResource>

export function createCategoryResource(entity: CategoryAttributes) {
  return {
    id: entity.id as number,
    parentId: entity.parentId as number,
    path: entity.path,
    slug: entity.slug,
    displayName: entity.displayName,
    description: entity.description,
  }
}

export type CategoryBreadcrumbResource = ReturnType<typeof createCategoryResource>

export function createCategoryBreadcrumbResource(entity: CategoryAttributes) {
  return {
    id: entity.id as number,
    displayName: entity.displayName,
  }
}
