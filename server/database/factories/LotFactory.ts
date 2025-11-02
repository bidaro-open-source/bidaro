import type {
  Database,
  Lot,
  LotAttributes,
  LotAttributesOptional,
} from '~~/server/database'
import { lotStatuses } from '~~/server/constants'
import { Factory } from '../class/Factory'

type PartialAttributes = Partial<LotAttributes>
type CreationAttributes = LotAttributesOptional

export class LotFactory extends Factory<Lot> {
  public static readonly initialAmount: number = 100

  public static readonly initialDuration = '1_hour' as const

  public static readonly incorrectInitialDuration = '0_hour' as const

  public static readonly initialDurationInMs: number = 3600000

  public static readonly minAmount: number = 1

  public static readonly maxAmount: number = 99999999.99

  protected definition(attr: PartialAttributes): CreationAttributes {
    const lot = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

    if (!attr.userId) {
      throw new Error('userId attribute in LotFactory is required')
    }

    return {
      userId: attr.userId,
      winnerId: attr.winnerId ?? null,
      categoryId: attr.categoryId ?? null,
      title: attr.title ?? `l${lot}`,
      statusName: attr.statusName ?? lotStatuses.DRAFT,
      description: attr.description ?? null,
      initialAmount: attr.initialAmount ?? LotFactory.initialAmount,
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
