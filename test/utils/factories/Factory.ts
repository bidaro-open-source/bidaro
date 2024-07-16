import type { MakeNullishOptional } from 'sequelize/lib/utils'
import type {
  InferCreationAttributes,
  ModelStatic,
  Model as _Model,
} from 'sequelize'

export abstract class Factory<Model extends _Model = any> {
  private _state:
    MakeNullishOptional<InferCreationAttributes<Model>> | undefined

  protected static _model: ModelStatic<any>

  protected abstract definition(): MakeNullishOptional<
    InferCreationAttributes<Model>
  >

  public static new<T extends Factory>(this: new () => T): T {
    return new this()
  }

  public static init(_model: ModelStatic<any>) {
    this._model = _model
  }

  public make(): Model {
    return this.model().build(this.getState())
  }

  public create(): Promise<Model> {
    return this.model().create(this.getState())
  }

  protected model(): ModelStatic<Model> {
    return (this.constructor as typeof Factory)._model
  }

  protected getState(): MakeNullishOptional<InferCreationAttributes<Model>> {
    if (!this._state)
      this._state = this.definition()
    return this._state
  }
}
