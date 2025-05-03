import type { Model as SequelizeModel } from 'sequelize'

/**
 * Ensures that a specific attribute key exists in a Sequelize model instance.
 *
 * This function verifies that a requested attribute was properly
 * loaded/included in the query results.
 *
 * @param entity - The Sequelize model instance to check
 * @param includedKey - The name of the attribute key that should exist
 * @returns The value of the requested attribute
 * @throws Error if the attribute key doesn't exist in the model's dataValues
 *
 * @example
 * // Get the user's email, ensuring it was loaded in the query
 * const email = ensureIncludedKey(userModel, 'email')
 */
export function ensureIncludedKey<
  T extends SequelizeModel,
  K extends keyof T['_attributes'],
>(entity: T, includedKey: K): T['_attributes'][K] {
  if (!(includedKey in entity.dataValues)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: `"${String(includedKey)}" was not exists`,
    })
  }

  return entity[includedKey]
}

/**
 * Ensures that a specific associated model was included in a Sequelize query.
 *
 * This function verifies that a requested association was properly included
 * through the `include` option in the initial query.
 *
 * @param entity - The parent model instance containing the associated model
 * @param includedModelKey - The name of the association that should be included
 * @returns The associated model or collection
 * @throws Error if the associated model wasn't included in the query options
 * @throws Error if the include array doesn't contain the requested model key
 *
 * @example
 * // Get the user's profile, ensuring it was included in the query
 * const profile = ensureIncludedModel(userModel, 'profile')
 *
 * // Get the user's posts, ensuring they were included in the query
 * const posts = ensureIncludedModel(userModel, 'posts')
 */
export function ensureIncludedModel<
  T extends object,
  K extends keyof T,
>(entity: T, includedModelKey: K): T[K] {
  // @ts-expect-error private sequlize api
  const includedArray: unknown[] = entity?._options?.includeNames
  const includedArrayExists = !!includedArray

  if (!includedArrayExists) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: `"${String(includedModelKey)}" was not included`,
    })
  }

  if (!includedArray.includes(includedModelKey)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: `"${String(includedModelKey)}" was not included`,
    })
  }

  return entity[includedModelKey]
}
