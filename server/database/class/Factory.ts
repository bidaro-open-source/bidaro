import type {
  InferAttributes,
  InferCreationAttributes,
  ModelStatic,
  Model as SequelizeModel,
} from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'

/**
 * Factory abstract class
 *
 * Brings out the repetitive logic of the factory's interaction with the model.
 *
 * To use a factory, you need to run `init()` method once, passing the model
 * it will work with.
 *
 * Using `new()`, you create a new factory instance with creation methods.
 *
 * Using `make()` or `create()` of factory instance, you create a new
 * instance of the model with the state from the factory `definition` method.
 *
 * @example
 * ```typescript
 * // All model attributes marked as optional
 * type PartialAttributes = Partial<SomeAttributes>
 *
 * // All model attributes marked as optional, except for
 * // those used in the creation of the model
 * type CreationAttributes = SomeAttributesOptional
 *
 * export class SomeFactory extends Factory<SomeModel> {
 *   protected definition(attr: PartialAttributes = {}): CreationAttributes {
 *     const random = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
 *     return {
 *       creationProperty: attr.creationProperty ?? `#${random}`,
 *     }
 *   }
 * }
 *
 * SomeFactory.init(SomeModel);
 *
 * SomeFactory.new().make();
 *
 * SomeFactory.new().create();
 * ```
 */
export abstract class Factory<Model extends SequelizeModel = any> {
  /**
   * Load model to factory.
   *
   * @static
   */
  protected static _model: ModelStatic<any>

  /**
   * Create new instance of factory.
   *
   * @static
   */
  public static new<T extends Factory>(this: new () => T): T {
    return new this()
  }

  /**
   * Initialize a factory globally.
   *
   * @param _model
   * @static
   */
  public static init(_model: ModelStatic<any>) {
    this._model = _model
  }

  /**
   * Define state of current factory instance.
   */
  protected abstract definition(
    attributes?: Partial<InferAttributes<Model>>
  ): MakeNullishOptional<InferCreationAttributes<Model>>

  /**
   * Returns static model of the factory.
   *
   * @returns static model of the factory
   */
  protected getModel(): ModelStatic<Model> {
    return (this.constructor as typeof Factory)._model
  }

  /**
   * Alias for `Model.build` with defined state.
   *
   * @returns builded model of the factory.
   */
  public make(attributes?: Partial<InferAttributes<Model>>): Model {
    return this.getModel().build(this.definition(attributes))
  }

  /**
   * Alias for `Model.create` with defined state.
   *
   * @returns builded model of the factory.
   */
  public create(attributes?: Partial<InferAttributes<Model>>): Promise<Model> {
    return this.getModel().create(this.definition(attributes))
  }
}
