import type { Lot } from '../database'

export type LotResource = ReturnType<typeof createLotResource>

export function createLotResource(entity: Lot) {
  return {
    id: ensureIncludedKey(entity, 'id') as number,
    title: ensureIncludedKey(entity, 'title'),
    description: ensureIncludedKey(entity, 'description'),
    status: ensureIncludedKey(entity, 'statusName') as string,
    effectiveDate: ensureIncludedKey(entity, 'effectiveDate'),
    expirationDate: ensureIncludedKey(entity, 'expirationDate'),
    initialDuration: ensureIncludedKey(entity, 'initialDuration'),
    initialAmount: ensureIncludedKey(entity, 'initialAmount'),
    updatedAt: ensureIncludedKey(entity, 'updatedAt'),
    createdAt: ensureIncludedKey(entity, 'createdAt'),
  }
}
