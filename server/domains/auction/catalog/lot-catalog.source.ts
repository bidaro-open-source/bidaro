import type { WhereOptions } from 'sequelize'
import type { LotAttributes } from '~~/server/database'
import { lotCatalogRepository } from './lot-catalog.repository'

interface GetAllForCatalogOptions {
  where?: WhereOptions<LotAttributes>
  limit: number
  offset: number
  categoryPath?: string
  order?: Array<[string, 'ASC' | 'DESC']>
}

class LotCatalogSource {
  protected readonly scope = 'catalog'

  protected get keys() {
    return {
      catalog: (limit: number, offset: number, categoryPath: string) =>
        `${this.scope}:${limit}:${offset}:${categoryPath}`,
    }
  }

  async invalidate() {
    console.warn('LotCatalogSource.invalidate() is not implemented')
  }

  async invalidateAll() {
    const redis = useRedis()
    const keys = await redis.keys(`${this.scope}:*`)
    if (keys.length > 0) {
      await redis.del(keys)
    }
  }

  async getAllForCatalog(options: GetAllForCatalogOptions) {
    const categoryPath = options.categoryPath ?? ''
    const key = this.keys.catalog(options.limit, options.offset, categoryPath)

    return await useDatabaseCache(key, async () => {
      const { rows, count } = await lotCatalogRepository.findAllForCatalog({
        where: options.where,
        limit: options.limit,
        offset: options.offset,
        categoryPath: categoryPath || undefined,
        order: options.order,
      })

      return {
        count,
        rows: rows.map((lot) => {
          if (!lot.seller) {
            throw createError({
              message: 'Продавця лоту не знайдено',
              status: 500,
            })
          }

          return {
            ...lot.toJSON(),
            cover: lot.cover?.image?.toJSON() ?? null,
            category: lot.category?.toJSON() ?? null,
            seller: lot.seller.toJSON(),
            winner: lot.winner?.toJSON() ?? null,
          }
        }),
      }
    }, { ttl: 900 })
  }
}

export const lotCatalogSource = new LotCatalogSource()
