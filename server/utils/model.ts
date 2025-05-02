import type { Model as SequelizeModel } from 'sequelize'

/**
 *
 * @param entity model instance
 * @param includedKey key
 */
export function ensureIncludedKey<
  T extends SequelizeModel,
  K extends keyof T['_attributes'],
>(entity: T, includedKey: K): T['_attributes'][K] {
  if (!(includedKey in entity.dataValues)) {
    throw new Error(`Error: "${String(includedKey)}" was not exists.`)
  }

  return entity[includedKey]
}

/**
 *
 * @param entity model instance
 * @param includedModelKey key
 */
export function ensureIncludedModel<
  T extends object,
  K extends keyof T,
>(entity: T, includedModelKey: K): T[K] {
  // @ts-expect-error private sequlize api
  const includedArray: unknown[] = entity?._options?.includeNames
  const includedArrayExists = !!includedArray

  if (!includedArrayExists) {
    throw new Error(
      `Error: "${String(includedModelKey)}" was not included.`,
    )
  }

  if (!includedArray.includes(includedModelKey)) {
    throw new Error(
      `Error: "${String(includedModelKey)}" was not included.`,
    )
  }

  return entity[includedModelKey]
}
