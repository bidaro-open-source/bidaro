import type { Lot } from '../database'
import { normalizeLotDuration } from '../services/lot-service'

export type LotResource = ReturnType<typeof createLotResource>

export function createLotResource(entity: Lot) {
  return {
    id: ensureIncludedKey(entity, 'id') as number,
    title: ensureIncludedKey(entity, 'title'),
    description: ensureIncludedKey(entity, 'description'),
    initialAmount: ensureIncludedKey(entity, 'initialAmount'),
    status: ensureIncludedKey(entity, 'statusName') as string,
    duration: normalizeLotDuration(ensureIncludedKey(entity, 'duration')),
    startDate: ensureIncludedKey(entity, 'startDate'),
    endDate: ensureIncludedKey(entity, 'endDate'),
    updatedAt: ensureIncludedKey(entity, 'updatedAt'),
    createdAt: ensureIncludedKey(entity, 'createdAt'),
  }
}
