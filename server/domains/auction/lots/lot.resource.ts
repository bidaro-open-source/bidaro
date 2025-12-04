import type { LotAttributes } from '#database'
import { BaseResource } from '#classes/BaseResource'

export interface LotDto {
  id: number
  winnerId: number
  categoryId: number | null
  description: string | null
  title: string
  initialPrice: number
  currentPrice: number
  effectiveDate: string | null
  expirationDate: string | null
  initialDuration: string
  statusName: string
}

class LotResource extends BaseResource<LotAttributes, LotDto> {
  protected transform(entity: LotAttributes): LotDto {
    return {
      id: entity.id as number,
      winnerId: entity.winnerId as number,
      categoryId: entity.categoryId as number | null,
      description: entity.description,
      title: entity.title,
      initialPrice: entity.initialPrice,
      currentPrice: entity.currentPrice,
      effectiveDate: entity.effectiveDate as string | null,
      expirationDate: entity.expirationDate as string | null,
      initialDuration: entity.initialDuration,
      statusName: entity.statusName,
    }
  }
}

export const lotResource = new LotResource()
