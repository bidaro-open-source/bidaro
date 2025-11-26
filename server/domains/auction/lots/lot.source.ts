import type { WhereOptions } from 'sequelize'
import type { Lot, LotAttributes } from '../../../database'
import { Source } from '~~/server/class/Source'
import { lotBetRepository } from '../bets/lot-bet.repository'
import { lotImageRepository } from '../images/lot-image.repository'
import { lotRepository } from './lot.repository'

function maskUsername(username: string | undefined): string {
  if (!username || username.length < 2)
    return '***'
  return username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
}

interface GetAllForCatalogOptions {
  where?: WhereOptions<LotAttributes>
  limit?: number
  offset?: number
}

class LotSource extends Source<Lot> {
  protected readonly scope = 'lots'

  protected get keys() {
    return {
      one: (id: number) => `${this.scope}:id:${id}`,
      oneBets: (id: number) => `${this.scope}:id:${id}:bets`,
      oneImages: (id: number) => `${this.scope}:id:${id}:images`,
    }
  }

  protected getEntityKeys(lot: Lot): string[] {
    return [
      this.keys.one(lot.id),
      this.keys.oneBets(lot.id),
      this.keys.oneImages(lot.id),
    ]
  }

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

  async getAllImagesById(lotId: number) {
    const key = this.keys.oneImages(lotId)

    return await useDatabaseCache(key, async () => {
      return await lotImageRepository.findAllByLotId(lotId)
    })
  }

  async getAllForCatalog(options: GetAllForCatalogOptions = {}) {
    const { rows, count } = await lotRepository.findAllForCatalog({
      where: options.where,
      limit: options.limit,
      offset: options.offset,
    })

    return {
      count,
      rows: rows.map((lot) => {
        const coverImage = lot.cover?.image

        return {
          id: lot.id,
          title: lot.title,
          description: lot.description,
          initialPrice: lot.initialPrice,
          currentPrice: lot.currentPrice,
          effectiveDate: lot.effectiveDate,
          expirationDate: lot.expirationDate,
          initialDuration: lot.initialDuration,
          statusName: lot.statusName,
          createdAt: lot.createdAt,
          updatedAt: lot.updatedAt,
          cover: coverImage
            ? { bucket: coverImage.bucket, key: coverImage.key }
            : null,
          category: lot.category
            ? { id: lot.category.id, displayName: lot.category.displayName }
            : null,
          seller: lot.seller
            ? { name: lot.seller.name, surname: lot.seller.surname, username: lot.seller.username }
            : null,
          winner: lot.winner
            ? { username: maskUsername(lot.winner.username) }
            : null,
        }
      }),
    }
  }
}

export const lotSource = new LotSource()
