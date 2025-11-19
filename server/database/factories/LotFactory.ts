import type {
  Database,
  Lot,
  LotAttributes,
  LotAttributesOptional,
} from '~~/server/database'
import {
  lotInitialDurations,
  lotInitialDurationsInMs,
  lotStatuses,
} from '../../constants'
import { Factory } from '../class/Factory'

type PartialAttributes = Partial<LotAttributes>
type CreationAttributes = LotAttributesOptional

export class LotFactory extends Factory<Lot> {
  public static readonly initialPrice: number = 100

  public static readonly initialDuration = lotInitialDurations.ONE_HOUR

  public static readonly incorrectInitialDuration = '0_hour' as const

  public static readonly initialDurationInMs: number = lotInitialDurationsInMs[lotInitialDurations.ONE_HOUR]

  public static readonly minAmount: number = 1

  public static readonly maxAmount: number = 99999999.99

  protected definition(attr: PartialAttributes): CreationAttributes {
    const lot = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    const lotStatus = attr.statusName ?? lotStatuses.DRAFT

    if (!attr.sellerId) {
      throw new Error('sellerId attribute in LotFactory is required')
    }

    if (lotStatus !== lotStatuses.DRAFT) {
      if (!attr.effectiveDate) {
        throw new Error('effectiveDate attribute in LotFactory is required for non-draft lots')
      }
      if (!attr.expirationDate) {
        throw new Error('expirationDate attribute in LotFactory is required for non-draft lots')
      }
      if (!attr.categoryId) {
        throw new Error('categoryId attribute in LotFactory is required for non-draft lots')
      }
    }

    return {
      sellerId: attr.sellerId,
      winnerId: attr.winnerId ?? null,
      categoryId: attr.categoryId ?? null,
      title: attr.title ?? `l${lot}`,
      statusName: attr.statusName ?? lotStatuses.DRAFT,
      description: attr.description ?? null,
      initialPrice: attr.initialPrice ?? LotFactory.initialPrice,
      initialDuration: attr.initialDuration ?? LotFactory.initialDuration,
      effectiveDate: attr.effectiveDate ?? null,
      expirationDate: attr.expirationDate ?? null,
    }
  }
}

export function InitializeLotFactroy(database: Database) {
  LotFactory.init(database.Lot)
  return LotFactory
}
