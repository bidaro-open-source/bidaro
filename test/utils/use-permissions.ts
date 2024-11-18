import { Op } from 'sequelize'
import { permissions } from '~/server/constants'
import type { Database } from '~/server/database'

type PermissionNameMap = {
  [K in string]: number
}

type PermissionIdMap = {
  -readonly [K in keyof typeof permissions]: number
}

export async function usePermissions(db: Database): Promise<PermissionIdMap> {
  const recordMap: Partial<PermissionNameMap> = {}
  const permissionMap: Partial<PermissionIdMap> = {} as PermissionIdMap

  const records = await db.Permission.findAll({
    where: {
      name: {
        [Op.in]: Object.values(permissions),
      },
    },
  })

  for (const record of records) {
    recordMap[record.name] = record.id
  }

  for (const key in permissions) {
    const permissionName = permissions[key as keyof typeof permissions]
    const permissionId = recordMap[permissionName]

    if (!permissionId) {
      throw new Error(`Permission with id "${permissionId}" not found.`
        + `Permission name is "${permissionName}", key is "${key}"`,
      )
    }

    permissionMap[key as keyof PermissionIdMap] = permissionId
  }

  return permissionMap as PermissionIdMap
}
