/**
 * Abstract base class for the Resource layer (Data Transformation).
 *
 * Its main purpose is to transform database models (Entities) into
 * clean Data Transfer Objects (DTOs) for the API response.
 *
 * @template Input - The type of the source entity (e.g., Sequelize Model `User`).
 * @template Output - The type of the resulting object (e.g., `UserDto`).
 */
export abstract class BaseResource<Input, Output> {
  /**
   * Transforms a single entity into a DTO.
   *
   * This method must be implemented by the subclass to define
   * the specific transformation logic.
   *
   * @param item - The source entity to transform (guaranteed to be non-null).
   * @returns The transformed DTO.
   */
  protected abstract transform(item: Input): Output

  /**
   * Returns null if the input is null or undefined.
   */
  public make(item: null | undefined): null

  /**
   * Returns the transformed DTO if the input is a valid entity.
   */
  public make(item: Input): Output

  /**
   * Handles union types (Entity | null).
   */
  public make(item: Input | null | undefined): Output | null

  /**
   * Transforms a single entity or returns null if the input is empty.
   * This is the public entry point for single-item transformation.
   *
   * @param item - The source entity or null/undefined.
   * @returns The transformed DTO or null.
   */
  public make(item: Input | null | undefined): Output | null {
    if (item === null || item === undefined) {
      return null
    }

    return this.transform(item)
  }

  /**
   * Transforms an array of entities into an array of DTOs.
   *
   * @param items - An array of source entities (or null/undefined).
   * @returns An array of transformed DTOs (returns empty array if input is null).
   */
  public collection(items: Input[] | null | undefined): Output[] {
    if (!items || !Array.isArray(items)) {
      return []
    }

    return items.map(item => this.transform(item))
  }
}
