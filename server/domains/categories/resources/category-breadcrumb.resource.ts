import type { CategoryAttributes } from '#database'
import { BaseResource } from '#classes/BaseResource'

export interface CategoryBreadcrumbDto {
  id: number
  displayName: string
}

class CategoryBreadcrumbResource extends BaseResource<CategoryAttributes, CategoryBreadcrumbDto> {
  protected transform(entity: CategoryAttributes): CategoryBreadcrumbDto {
    return {
      id: entity.id,
      displayName: entity.displayName,
    }
  }
}

export const categoryBreadcrumbResource = new CategoryBreadcrumbResource()
