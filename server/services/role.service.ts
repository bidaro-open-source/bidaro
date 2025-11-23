import type { RoleAttributesOptional } from '../database'
import { roles } from '../constants'
import { roleRepository } from '../repositories/role.repository'

const reservedRoles: readonly string[] = [roles.USER]

export const roleService = {
  /**
   * Checks if a role is reserved.
   *
   * @param name - role name
   * @returns true if role is reserved
   */
  isReserved(name: string): boolean {
    return reservedRoles.includes(name)
  },

  /**
   * Gets all roles.
   *
   * @returns array of roles
   */
  async getAll() {
    return await roleRepository.findAll()
  },

  /**
   * Gets a role by name.
   *
   * @param name - role name
   * @returns role instance
   * @throws 404 if role not found
   */
  async getByName(name: string) {
    const role = await roleRepository.findByName(name)

    if (!role) {
      throw createError({
        statusCode: 404,
        message: 'Роль не знайдено',
      })
    }

    return role
  },

  /**
   * Creates a new role.
   *
   * @param data - role data
   * @returns role instance
   * @throws 422 if role name already exists
   */
  async create(data: RoleAttributesOptional) {
    return await useDatabaseTransaction(async (transaction) => {
      const existingRole = await roleRepository.findByName(data.name, { transaction })

      if (existingRole) {
        throw createError({
          statusCode: 422,
          message: 'Роль з такою назвою вже існує',
        })
      }

      const role = await roleRepository.create(data, { transaction })

      return role
    })
  },

  /**
   * Updates a role.
   *
   * @param name - role name
   * @param data - role data to update
   * @returns updated role instance
   * @throws 404 if role not found
   */
  async update(name: string, data: Partial<Pick<RoleAttributesOptional, 'displayName' | 'description'>>) {
    return await useDatabaseTransaction(async (transaction) => {
      const role = await roleRepository.findByNameWithLock(name, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!role) {
        throw createError({
          statusCode: 404,
          message: 'Роль не знайдено',
        })
      }

      const displayName = Object.hasOwn(data, 'displayName')
        ? data.displayName
        : role.displayName
      const description = Object.hasOwn(data, 'description')
        ? data.description
        : role.description

      const updatedRole = await roleRepository.updateByName(
        name,
        {
          displayName: displayName ?? null,
          description: description ?? null,
        },
        { transaction },
      )

      return updatedRole
    })
  },

  /**
   * Updates role permissions.
   *
   * @param name - role name
   * @param permissionNames - array of permission names
   * @returns updated role instance
   * @throws 404 if role not found
   * @throws 400 if trying to update reserved role
   */
  async updatePermissions(name: string, permissionNames: string[]) {
    return await useDatabaseTransaction(async (transaction) => {
      const role = await roleRepository.findByNameWithLock(name, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!role) {
        throw createError({
          statusCode: 404,
          message: 'Роль не знайдено',
        })
      }

      if (roleService.isReserved(name)) {
        throw createError({
          statusCode: 400,
          message: 'Не можна змінювати права зарезервованої ролі',
        })
      }

      const db = useDatabase()

      // Get all permissions to validate
      const permissions = await db.Permission.findAll({
        where: { name: permissionNames },
        transaction,
      })

      if (permissions.length !== permissionNames.length) {
        throw createError({
          statusCode: 422,
          message: 'Одне або більше прав не знайдено',
        })
      }

      // Set permissions
      await role.setPermissions(permissions, { transaction })

      // Reload role with permissions
      const updatedRole = await roleRepository.findByName(name, { transaction })

      if (!updatedRole) {
        throw createError({
          statusCode: 500,
          message: 'Не вдалося завантажити оновлену роль',
        })
      }

      return updatedRole
    })
  },

  /**
   * Deletes a role.
   *
   * @param name - role name
   * @throws 404 if role not found
   * @throws 400 if role is reserved
   * @throws 400 if role contains users
   */
  async delete(name: string) {
    return await useDatabaseTransaction(async (transaction) => {
      const role = await roleRepository.findByNameWithLock(name, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!role) {
        throw createError({
          statusCode: 404,
          message: 'Роль не знайдено',
        })
      }

      if (roleService.isReserved(name)) {
        throw createError({
          statusCode: 400,
          message: 'Не можна видалити зарезервовану роль',
        })
      }

      const userCount = await roleRepository.countUsersByName(name, { transaction })

      if (userCount > 0) {
        throw createError({
          statusCode: 400,
          message: 'Не можна видалити роль, яка призначена користувачам',
        })
      }

      await roleRepository.destroyByName(name, { transaction })
    })
  },
}
