import type { LotBetAttributes } from '#database'
import { BaseResource } from '#class/BaseResource'

export interface LotBetDto {
  id: number
  amount: number
}

class LotBetResource extends BaseResource<LotBetAttributes, LotBetDto> {
  protected transform(entity: LotBetAttributes): LotBetDto {
    return {
      id: entity.id,
      amount: entity.amount,
    }
  }
}

export const lotBetResource = new LotBetResource()
