import type { Attributes, InferCreationAttributes, LOCK, Model, ModelStatic, Transaction, WhereOptions } from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/lib/utils'
import { Op } from 'sequelize'

type PrimaryKey = number | string

interface RepositoryFindAllOptions<DataEntity extends Model> {
  where?: WhereOptions<DataEntity>
  limit?: number
  offset?: number
  order?: Array<[string, 'ASC' | 'DESC']>
}

export interface RepositoryOptions {
  lock?: LOCK
  transaction?: Transaction
}

/**
 * Abstract base class for Repository pattern.
 *
 * Provides standardized CRUD operations with transaction support.
 *
 * @template DataEntity - The Sequelize Model instance type
 * @template CAttributes - Creation attributes (input payload for create)
 */
export abstract class Repository<
  DataEntity extends Model,
  CAttributes extends object = MakeNullishOptional<InferCreationAttributes<DataEntity>>,
> {
  /**
   * Must be implemented by the subclass to provide the specific Sequelize model.
   * e.g. `return useDatabase().User`
   */
  protected abstract get model(): ModelStatic<DataEntity>

  /**
   * Helper to get the name of the Primary Key column dynamically.
   * e.g. returns 'id', 'uuid', or 'name'.
   */
  protected get pkName(): string {
    return this.model.primaryKeyAttribute
  }

  /**
   * Find all records matching specific criteria (optional).
   * If no options provided, returns all records.
   *
   * @param options - Optional repository options including where clause
   */
  async findAll(options: RepositoryOptions & RepositoryFindAllOptions<DataEntity> = {}) {
    return this.model.findAll({
      where: options.where,
      transaction: options.transaction,
      lock: options.lock,
    })
  }

  /**
   * Find all records matching specific criteria and count it.
   * If no options provided, returns all records.
   *
   * @param options - Optional repository options including where clause
   */
  async findAllAndCount(options: RepositoryOptions & RepositoryFindAllOptions<DataEntity> = {}) {
    return this.model.findAndCountAll({
      transaction: options.transaction,
      where: options.where,
      lock: options.lock,
      limit: options.limit,
      offset: options.offset,
      order: options.order,
    })
  }

  /**
   * Find a record by its Primary Key.
   *
   * @param pk - Primary Key value
   * @param options - Optional repository options
   */
  async findByPk(pk: PrimaryKey, options: RepositoryOptions = {}) {
    return this.model.findByPk(pk, {
      lock: options.lock,
      transaction: options.transaction,
    })
  }

  /**
   * Find multiple records by their Primary Keys.
   *
   * @param pks - Array of Primary Key values
   * @param options - Optional repository options
   */
  async findByPks(pks: PrimaryKey[], options: RepositoryOptions = {}) {
    return this.model.findAll({
      transaction: options.transaction,
      lock: options.lock,
      where: {
        [this.pkName]: { [Op.in]: pks },
      } as WhereOptions<DataEntity>,
    })
  }

  /**
   * Create a new record.
   *
   * @param payload - Creation attributes
   * @param options - Optional repository options
   */
  async create(payload: CAttributes, options: RepositoryOptions = {}) {
    // @ts-expect-error: Sequelize types can be tricky with generics, strictly passed payload matches CAttributes
    return this.model.create(payload, {
      transaction: options.transaction,
    })
  }

  /**
   * Update a record by Primary Key.
   * Returns the updated record or null if not found.
   *
   * @param pk - Primary Key value
   * @param payload - Partial attributes to update
   * @param options - Optional repository options
   * @return The updated record
   * @throws Error if record not found
   */
  async updateByPk(
    pk: PrimaryKey,
    payload: Partial<Attributes<DataEntity>>,
    options: RepositoryOptions = {},
  ) {
    const [affectedCount, affectedRows] = await this.model.update(payload, {
      where: { [this.pkName]: pk } as WhereOptions<DataEntity>,
      transaction: options.transaction,
      returning: true,
    })

    if (affectedCount === 0 || !affectedRows[0]) {
      throw new Error('Record not found for update')
    }

    return affectedRows[0] as DataEntity
  }

  /**
   * Delete a record by Primary Key.
   * Returns the number of destroyed rows (1 or 0).
   *
   * @param pk - Primary Key value
   * @param options - Optional repository options
   */
  async destroyByPk(pk: PrimaryKey, options: RepositoryOptions = {}) {
    return this.model.destroy({
      where: { [this.pkName]: pk } as WhereOptions<DataEntity>,
      transaction: options.transaction,
    })
  }

  /**
   * Delete a record by Primary Key.
   * Returns the number of destroyed rows (1 or 0).
   *
   * @param pks - Arrray of Primary Key value
   * @param options - Optional repository options
   */
  async destroyByPks(pks: PrimaryKey[], options: RepositoryOptions = {}) {
    return this.model.destroy({
      transaction: options.transaction,
      where: {
        [this.pkName]: {
          [Op.in]: pks,
        },
      } as WhereOptions<DataEntity>,
    })
  }
}
