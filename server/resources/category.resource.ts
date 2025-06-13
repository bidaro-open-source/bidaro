import type { Category } from '../database/models/Category'

interface CategoryTree {
  id: number
  displayName: string
  description: string | null
  children?: CategoryTree[]
}

interface CategoryParentTree {
  id: number
  displayName: string
  description: string | null
  parent: CategoryParentTree | null
}

export const categoryResource = {
  create(category: Category) {
    return {
      id: category.id,
      displayName: category.displayName,
      description: category.description,
    }
  },

  createTree(category: Category): CategoryTree {
    const children = category.children ? category.children : []

    return {
      id: category.id,
      displayName: category.displayName,
      description: category.description,
      children: children.map(categoryResource.createTree),
    }
  },

  createParentTree(category: Category): CategoryParentTree {
    const parent = category.parent
      ? categoryResource.createParentTree(category.parent)
      : null

    return {
      id: category.id,
      displayName: category.displayName,
      description: category.description,
      parent,
    }
  },
}
