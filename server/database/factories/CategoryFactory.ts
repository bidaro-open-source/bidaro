import type {
  Category,
  CategoryAttributes,
  CategoryAttributesOptional,
  Database,
} from '~~/server/database'
import { v4 as uuidv4 } from 'uuid'
import { Factory } from '../class/Factory'

type PartialAttributes = Partial<CategoryAttributes>
type CreationAttributes = CategoryAttributesOptional

export class CategoryFactory extends Factory<Category> {
  protected definition(attr: PartialAttributes = {}): CreationAttributes {
    return {
      slug: attr.slug ?? uuidv4(),
      displayName: attr.displayName ?? uuidv4(),
      description: attr.description ?? null,
      parentId: attr.parentId ?? null,
    }
  }
}

export function InitializeCategoryFactroy(database: Database) {
  CategoryFactory.init(database.Category)
  return CategoryFactory
}
