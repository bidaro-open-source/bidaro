import type { RoleAttributesOptional } from '#database'
import { permissionRepository } from '../permission/permission.repository'
import { roleRepository } from './role.repository'
import { roleSource } from './role.source'

type RoleCreateData = Omit<RoleAttributesOptional, 'isReserved'>

class RoleService {
  /**
   * Creates a new role.
   *
   * @param data - role data
   * @returns role instance
   * @throws ROLE_NAME_TAKEN - When role name already exists
   */
  async create(data: RoleCreateData) {
    return await useDatabaseTransaction(async (transaction) => {
      const existingRole = await roleRepository.findByPk(data.name, { transaction })

      if (existingRole) {
        throw createAppError('ROLE_NAME_TAKEN')
      }

      const role = await roleRepository.create(data, { transaction })

      useDatabaseAfterCommit(transaction, 'role.service.create', async () => {
        await roleSource.invalidate(role)
      })

      return role
    })
  }

  /**
   * Updates a role.
   *
   * @param name - role name
   * @param data - role data to update
   * @returns updated role instance
   * @throws ROLE_NOT_FOUND
   */
  async update(name: string, data: Partial<Pick<RoleAttributesOptional, 'displayName' | 'description'>>) {
    return await useDatabaseTransaction(async (transaction) => {
      const role = await roleRepository.findByPk(name, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!role) {
        throw createAppError('ROLE_NOT_FOUND')
      }

      const displayName = Object.hasOwn(data, 'displayName')
        ? data.displayName
        : role.displayName

      const description = Object.hasOwn(data, 'description')
        ? data.description
        : role.description

      const updatedRole = await roleRepository.updateByPk(
        name,
        {
          displayName: displayName ?? null,
          description: description ?? null,
        },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'role.service.update', async () => {
        await roleSource.invalidate([role, updatedRole])
      })

      return updatedRole
    })
  }

  /**
   * Updates role permissions.
   *
   * @param name - role name
   * @param permissionNames - array of permission names
   * @returns role instance
   * @throws ROLE_NOT_FOUND
   * @throws ROLE_IS_RESERVED - When trying to update permissions of a reserved role
   */
  async updatePermissions(name: string, permissionNames: string[]) {
    return await useDatabaseTransaction(async (transaction) => {
      const role = await roleRepository.findByPk(name, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!role) {
        throw createAppError('ROLE_NOT_FOUND')
      }

      if (role.isReserved) {
        throw createAppError('ROLE_IS_RESERVED')
      }

      const permissions = await permissionRepository.findByPks(permissionNames, { transaction })

      if (permissions.length !== permissionNames.length) {
        throw createAppError('PERMISSIONS_NOT_FOUND')
      }

      await roleRepository.updatePermissionsByPk(name, permissionNames, { transaction })

      useDatabaseAfterCommit(transaction, 'role.service.update_permissions', async () => {
        await roleSource.invalidate(role)
      })

      return role
    })
  }

  /**
   * Deletes a role.
   *
   * @param name - role name
   * @throws ROLE_NOT_FOUND
   * @throws ROLE_IS_RESERVED
   * @throws ROLE_HAS_USERS
   */
  async delete(name: string) {
    return await useDatabaseTransaction(async (transaction) => {
      const role = await roleRepository.findByPk(name, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!role) {
        throw createAppError('ROLE_NOT_FOUND')
      }

      if (role.isReserved) {
        throw createAppError('ROLE_IS_RESERVED')
      }

      const userCount = await roleRepository.countUsersByName(name, { transaction })

      if (userCount > 0) {
        throw createAppError('ROLE_HAS_USERS')
      }

      await roleRepository.destroyByPk(name, { transaction })

      useDatabaseAfterCommit(transaction, 'role.service.delete', async () => {
        await roleSource.invalidate(role)
      })
    })
  }
}

export const roleService = new RoleService()
