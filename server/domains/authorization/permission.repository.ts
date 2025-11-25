import type { Permission, PermissionAttributesOptional } from '../../database'
import { Repository } from '~~/server/class/Repository'

class PermissionRepository extends Repository<Permission, PermissionAttributesOptional> {
  protected get model() {
    return useDatabase().Permission
  }
}

export const permissionRepository = new PermissionRepository()
