import type {
  Database,
  LotBet,
  LotBetAttributes,
  LotBetAttributesOptional,
} from '#database'
import { Factory } from '../class/Factory'

type PartialAttributes = Partial<LotBetAttributes>
type CreationAttributes = LotBetAttributesOptional

export class LotBetFactory extends Factory<LotBet> {
  public static readonly amount: number = 200

  public static readonly minAmount: number = 1

  public static readonly maxAmount: number = 99999999.99

  protected definition(attr: PartialAttributes): CreationAttributes {
    if (!attr.lotId) {
      throw new Error('lotId attribute in LotBetFactory is required')
    }

    if (!attr.userId) {
      throw new Error('userId attribute in LotBetFactory is required')
    }

    return {
      lotId: attr.lotId,
      userId: attr.userId,
      amount: attr.amount ?? LotBetFactory.amount,
    }
  }
}

export function InitializeLotBetFactroy(database: Database) {
  LotBetFactory.init(database.LotBet)
  return LotBetFactory
}
