import type { Permission } from '../../database'
import { Repository } from '~~/server/class/Repository'

class PermissionRepository extends Repository<Permission> {
  protected get model() {
    return useDatabase().Permission
  }
}

export const permissionRepository = new PermissionRepository()
