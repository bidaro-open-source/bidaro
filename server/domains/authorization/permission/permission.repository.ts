import type { Permission } from '#database'
import { BaseRepository } from '#class/BaseRepository'

class PermissionRepository extends BaseRepository<Permission> {
  protected get model() {
    return useDatabase().Permission
  }
}

export const permissionRepository = new PermissionRepository()
