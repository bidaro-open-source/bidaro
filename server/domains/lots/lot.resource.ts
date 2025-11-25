import type { LotAttributes } from '../../database'

export type LotResource = ReturnType<typeof createLotResource>

export function createLotResource(entity: LotAttributes) {
  return {
    id: entity.id as number,
    winnerId: entity.winnerId as number,
    categoryId: entity.categoryId as number | null,
    description: entity.description,
    title: entity.title,
    initialPrice: entity.initialPrice,
    currentPrice: entity.currentPrice,
    effectiveDate: entity.effectiveDate,
    expirationDate: entity.expirationDate,
    initialDuration: entity.initialDuration,
    statusName: entity.statusName,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}
