import type { Permission } from '#database'
import { BaseRepository } from '#classes/BaseRepository'

class PermissionRepository extends BaseRepository<Permission> {
  protected get model() {
    return useDatabase().Permission
  }
}

export const permissionRepository = new PermissionRepository()
