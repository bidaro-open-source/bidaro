import type { CategoryAttributes } from '#database'
import { BaseResource } from '#class/BaseResource'

export interface CategoryDto {
  id: number
  parentId: number | null
  path: string
  slug: string
  displayName: string
  description: string | null
}

class CategoryResource extends BaseResource<CategoryAttributes, CategoryDto> {
  protected transform(entity: CategoryAttributes): CategoryDto {
    return {
      id: entity.id,
      parentId: entity.parentId,
      path: entity.path,
      slug: entity.slug,
      displayName: entity.displayName,
      description: entity.description,
    }
  }
}

export const categoryResource = new CategoryResource()
