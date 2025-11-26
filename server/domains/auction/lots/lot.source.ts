import type { WhereOptions } from 'sequelize'
import type { Lot, LotAttributes } from '../../../database'
import { Source } from '~~/server/class/Source'
import { lotBetRepository } from '../bets/lot-bet.repository'
import { lotImageRepository } from '../images/lot-image.repository'
import { lotRepository } from './lot.repository'

interface GetAllForCatalogOptions {
  where?: WhereOptions<LotAttributes>
  limit: number
  offset: number
  categoryPath?: string
  order?: Array<[string, 'ASC' | 'DESC']>
}

class LotSource extends Source<Lot> {
  protected readonly scope = 'lots'

  protected get keys() {
    return {
      one: (id: number) => `${this.scope}:id:${id}`,
      oneBets: (id: number) => `${this.scope}:id:${id}:bets`,
      oneImages: (id: number) => `${this.scope}:id:${id}:images`,
      catalog: (limit: number, offset: number, categoryPath: string) =>
        `${this.scope}:catalog:${limit}:${offset}:${categoryPath}`,
    }
  }

  protected getEntityKeys(lot: Lot): string[] {
    return [
      this.keys.one(lot.id),
      this.keys.oneBets(lot.id),
      this.keys.oneImages(lot.id),
    ]
  }

  /**
   * Retrieve a lot by ID, utilizing Redis caching.
   *
   * @param id - The ID of the lot to fetch.
   * @throws 404 if the lot does not exist
   * @returns The lot instance
   */
  async getById(id: number) {
    const key = this.keys.one(id)

    return await useDatabaseCache(key, async () => {
      const data = await lotRepository.findByPk(id)

      if (!data) {
        throw createError({
          message: 'Лот не знайдено',
          status: 404,
        })
      }

      return data
    })
  }

  /**
   * Retrieve all bets for a given lot, utilizing Redis caching.
   *
   * @param lotId - The ID of the lot whose bets should be fetched.
   * @returns Array of lot bets for the specified lot
   */
  async getAllBetsById(lotId: number) {
    const key = this.keys.oneBets(lotId)

    return await useDatabaseCache(key, async () => {
      const data = await lotBetRepository.findAllByLotId(lotId)

      return data.map(bet => ({
        ...bet.toJSON(),
        user: { username: bet.user?.username || 'anonymous' },
      }))
    })
  }

  /**
   * Retrieve all images for a given lot, utilizing Redis caching.
   *
   * @param lotId - The ID of the lot whose images should be fetched.
   * @returns Array of images for the specified lot
   */
  async getAllImagesById(lotId: number) {
    const key = this.keys.oneImages(lotId)

    return await useDatabaseCache(key, async () => {
      return await lotImageRepository.findAllByLotId(lotId)
    })
  }

  /**
   * Retrieve all lots for the catalog with formatted data.
   *
   * @param options - query options including where, limit, offset, categoryPath, order
   * @returns formatted lots with count for pagination
   */
  async getAllForCatalog(options: GetAllForCatalogOptions) {
    const categoryPath = options.categoryPath ?? ''
    const key = this.keys.catalog(options.limit, options.offset, categoryPath)

    return await useDatabaseCache(key, async () => {
      const { rows, count } = await lotRepository.findAllForCatalog({
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

export const lotSource = new LotSource()
