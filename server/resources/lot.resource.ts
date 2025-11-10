import type { Lot } from '../database'

export type UserResource = ReturnType<typeof createLotResource>

export function createLotResource(entity: Lot) {
  return {
    id: entity.id as number,
    title: entity.title,
    initialAmount: entity.initialAmount,
    initialDuration: entity.initialDuration,
    statusName: entity.statusName,
  }
}
