import type { Lot } from '../database'
import { normalizeLotDuration } from '../services/lot-service'

export type LotResource = ReturnType<typeof createLotResource>

export function createLotResource(entity: Lot) {
  return {
    id: ensureIncludedKey(entity, 'id') as number,
    title: ensureIncludedKey(entity, 'title'),
    description: ensureIncludedKey(entity, 'description'),
    status: ensureIncludedKey(entity, 'statusName') as string,
    duration: normalizeLotDuration(ensureIncludedKey(entity, 'duration')),
    startDate: ensureIncludedKey(entity, 'startDate'),
    endDate: ensureIncludedKey(entity, 'endDate'),
  }
}
