import type { RepositoryOptions } from '~~/server/class/Repository'
import type { Role } from '../../../database'
import { Repository } from '~~/server/class/Repository'

class RoleRepository extends Repository<Role> {
  protected get model() {
    return useDatabase().Role
  }

  /**
   * Count users associated with a specific role name.
   *
   * @param name - Role name
   * @param options - Optional repository options
   * @return Number of users with the specified role name
   */
  async countUsersByName(name: string, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return await db.User.count({
      where: { roleName: name },
      transaction: options.transaction,
    })
  }

  /**
   * Find all permissions associated with a role by its primary key (name).
   *
   * @param name - Role name (Primary Key)
   * @param options - Optional repository options
   * @return Array of permissions associated with the role
   */
  async findAllPermissionsByPk(name: string, options: RepositoryOptions = {}) {
    const db = useDatabase()

    const role = await this.model.findByPk(name, {
      transaction: options.transaction,
      lock: options.lock,
      include: [
        {
          model: db.Permission,
          as: 'permissions',
          through: {
            attributes: [],
          },
        },
      ],
    })

    return role?.permissions ?? []
  }

  /**
   * Update permissions associated with a role by its primary key (name).
   *
   * @param name - Role name (Primary Key)
   * @param permissionNames - Array of permission names to associate with the role
   * @param options - Optional repository options
   * @return The updated role instance
   * @throws Error if the role is not found
   */
  async updatePermissionsByPk(
    name: string,
    permissionNames: string[],
    options: RepositoryOptions = {},
  ) {
    const role = await this.findByPk(name, options)

    if (!role) {
      throw new Error('Role not found')
    }

    await role.setPermissions(permissionNames, {
      transaction: options.transaction,
    })

    return role
  }
}

export const roleRepository = new RoleRepository()
