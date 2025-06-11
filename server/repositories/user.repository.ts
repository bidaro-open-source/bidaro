import type { Transaction } from 'sequelize'
import type { Lot, User, UserAttributesOptional } from '../database'
import type { LotBet } from '../database/models/LotBet'
import { Op } from 'sequelize'

interface Options {
  transaction?: Transaction
}

export const userRepository = {
  /**
   * Finds a user by their primary key.
   *
   * Included models:
   * - Role (all fields)
   *   - Permissions (all fields)
   *
   * @param id - user primary key
   * @param options - sequelize options
   * @returns user or null if not found
   */
  findById: (id: number, options: Options = {}): Promise<User | null> => {
    const db = useDatabase()

    return db.User.findByPk(id, {
      transaction: options.transaction,
      include: [
        {
          model: db.Role,
          as: 'role',
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    })
  },

  /**
   * Finds a user by their email.
   *
   * Included models:
   * - Role (all fields)
   *   - Permissions (all fields)
   *
   * @param email - user email
   * @param options - sequelize options
   * @returns user or null if not found
   */
  findByEmail: (email: string, options: Options = {}): Promise<User | null> => {
    const db = useDatabase()

    return db.User.findOne({
      transaction: options.transaction,
      where: { email },
      include: [
        {
          model: db.Role,
          as: 'role',
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    })
  },

  /**
   * Finds a user by their username.
   *
   * Included models:
   * - Role (all fields)
   *   - Permissions (all fields)
   *
   * @param username - username
   * @param options - sequelize options
   * @returns user or null if not found
   */
  findByUsername: (username: string, options: Options = {}): Promise<User | null> => {
    const db = useDatabase()

    return db.User.findOne({
      transaction: options.transaction,
      where: { username },
      include: [
        {
          model: db.Role,
          as: 'role',
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    })
  },

  /**
   * Finds a specific lot by primary key that belongs to a user.
   *
   * Included models:
   * - LotBet (all fields) (with limit 1)
   *   - User (all fields)
   *
   * @param id - user primary key
   * @param lotId - lot primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  findLotById(id: number, lotId: number, options: Options = {}): Promise<Lot | null> {
    const db = useDatabase()

    return db.Lot.findOne({
      transaction: options.transaction,
      where: { id: lotId, userId: id },
      include: [
        {
          model: db.LotBet,
          as: 'bets',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: db.User,
              as: 'user',
            },
          ],
        },
      ],
    })
  },

  /**
   * Finds all lots that belongs to a user.
   *
   * Included models:
   * - LotBet (all fields) (with limit 1)
   *   - User (all fields)
   *
   * @param id - user primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  findAllLotsById(id: number, options: Options = {}): Promise<Lot[]> {
    const db = useDatabase()

    return db.Lot.findAll({
      transaction: options.transaction,
      where: { userId: id },
      include: [
        {
          model: db.LotBet,
          as: 'bets',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: db.User,
              as: 'user',
            },
          ],
        },
      ],
    })
  },

  /**
   * Finds all published (not drafted) lots that belongs to a user.
   *
   * Included models:
   * - LotBet (all fields) (with limit 1)
   *   - User (all fields)
   *
   * @param id - user primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  findPublishedLotsById(id: number, options: Options = {}): Promise<Lot[]> {
    const db = useDatabase()

    return db.Lot.findAll({
      transaction: options.transaction,
      where: { userId: id, statusName: { [Op.ne]: 'draft' } },
      include: [
        {
          model: db.LotBet,
          as: 'bets',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: db.User,
              as: 'user',
            },
          ],
        },
      ],
    })
  },

  /**
   * Finds all bets that belongs to a user.
   *
   * Included models:
   * - Lot (all fields)
   *   - User (all fields)
   *   - LotBet (all fields) (wiPromise resolving to the newly created User instance with role includedth limit 1)
   *
   * @param id - user primary key
   * @param options - sequelize options
   * @returns lot or null if not found
   */
  findAllBetsById(id: number, options: Options = {}): Promise<LotBet[]> {
    const db = useDatabase()

    return db.LotBet.findAll({
      transaction: options.transaction,
      where: { userId: id },
      include: [
        {
          model: db.Lot,
          as: 'lot',
          include: [
            {
              model: db.User,
              as: 'user',
            },
            {
              model: db.LotBet,
              as: 'bets',
              limit: 1,
              order: [['createdAt', 'DESC']],
              include: [
                {
                  model: db.User,
                  as: 'user',
                },
              ],
            },
          ],
        },
      ],
    })
  },

  /**
   * Creates a new user record in the database.
   *
   * Included models:
   * - Role (all fields)
   *
   * @param fields - user attributes
   * @param options - sequelize options
   * @returns user instance
   */
  create(fields: UserAttributesOptional, options: Options = {}): Promise<User> {
    const db = useDatabase()

    return db.User.create(
      fields,
      {
        transaction: options.transaction,
        include: [
          {
            model: db.Role,
            as: 'role',
          },
        ],
      },
    )
  },

  /**
   * Save a chagned user record in the database.
   *
   * @param user - user instance
   * @param options - sequelize options
   * @returns lot instance
   */
  save(user: User, options: Options = {}): Promise<User> {
    return user.save({ transaction: options.transaction })
  },

  /**
   * Destorys a user record in the database.
   *
   * @param user - user instance
   * @param options - sequelize options
   */
  destroy(user: User, options: Options = {}): Promise<void> {
    return user.destroy({ transaction: options.transaction })
  },
}
